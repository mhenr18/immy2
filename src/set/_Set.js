import { emptySetInstance } from './_EmptySet'
import { formatObj } from '../util'
import SetObserverWrapper from './SetObserverWrapper'
import _MutableStack from '../mutable/_MutableStack'
import _MutablePool from '../mutable/_MutablePool'
import deletePatch from './deletePatch'
import insertPatch from './insertPatch'
import ImmyList from '../list'

let _stackCache = new _MutablePool(() => new _MutableStack())

class SetRoot {
  constructor () {
    this.locked = false
  }

  lock () {
    if (this.locked) {
      console.log('attempted to lock an already locked root')
    }

    this.locked = true
  }

  unlock () {
    if (!this.locked) {
      throw new Error('attempted to unlock an already unlocked root')
    }

    this.locked = false
  }

  isLocked () {
    return this.locked
  }
}

export default class _Set {
  // the given backing will *not* be copied.
  // this constructor is not suitable for use externally.
  constructor (backing, root) {
    this._backing = backing
    this.size = backing.size // size is a public API
    this.root = root || new SetRoot() // root is a public API

    this._i = null
    this._patchFunc = null
    this._patchTarget = null
  }

  _ensureUnlocked () {
    if (this.root.isLocked()) {
      throw new Error('unable to create new versions of a locked set')
    }
  }

  count () {
    return this.size
  }

  first () {
    const backing = this._getBacking()

    for (let v of backing) {
      return v
    }

    return undefined
  }

  clear () {
    return emptySetInstance
  }

  add (value) {
    if (this.has(value)) {
      return this
    }

    return this._withPatch(insertPatch, value)
  }

  delete (value) {
    if (!this.has(value)) {
      return
    }

    if (this.size === 1) {
      return emptySetInstance
    } else {
      return this._withPatch(deletePatch, value)
    }
  }

  has (value) {
    return this._getBacking().has(value)
  }

  toArray () {
    const backing = this._getBacking()
    return Array.from(backing)
  }

  toList () {
    return ImmyList(this.toArray(), true)
  }

  toSet () {
    return this
  }

  toJS () {
    return new Set(this._getBacking())
  }

  * [Symbol.iterator] () {
    // iteration over sets/sets is a weakness of immy - you can't create
    // any new versions of the list while iterating over it.
    const backing = this._getBacking()
    this.root.lock()

    try {
      yield* backing
    } finally {
      this.root.unlock()
    }
  }

  forEach (sideEffect, thisVal) {
    let i = 0
    for (let value of this) {
      if (sideEffect.call(thisVal, value, value, this) === false) {
        return i
      }

      ++i
    }

    return this.size
  }

  // if an observer function returns false, the observation will immediately
  // stop and this method will return false. otherwise, the method returns true.
  observeChangesFor (otherSet, observer) {
    if (this === otherSet) {
      return true
    }

    const wrapper = new SetObserverWrapper(observer)

    if (otherSet === emptySetInstance) {
      wrapper.clear(this._getBacking())
      return wrapper.active
    }

    if (this.root === otherSet.root) {
      // we can observe changes using patches. as the two set share a
      // root, calling ensureBacking on the otherSet will cause this set
      // to have a patch trail leading directly toward the otherSet.
      //
      // this trail will turn the otherSet into this, but we want to go the
      // other way and look at the patches to turn this into the otherSet.
      // so, we invert the patches.)

      otherSet._getBacking()

      let set = this
      while (set !== otherSet && wrapper.active) {
        set._patchFunc.inverse.callWrapper(set._i, wrapper)
        otherSet._getBacking() // in case we do something that references the set and moves the backing
        set = set._patchTarget
      }
    } else {
      // clear everything and just add everything from the new set.
      wrapper.clear(this._getBacking())

      if (wrapper.active) {
        wrapper.insertMany(otherSet._getBacking())
      }
    }

    return wrapper.active
  }

  toString () {
    let str = `ImmySet { `

    let first = true
    for (let value of this._getBacking()) {
      if (!first) {
        str += ', '
      }

      str += `${formatObj(value)}`
      first = false
    }

    str += ' }'
    return str
  }

  inspect () {
    return this.toString()
  }

  _withPatch (patchFunc, value) {
    this._ensureUnlocked()
  
    patchFunc(this._getBacking(), value)

    this._i = value
    this._patchFunc = patchFunc.inverse

    const newSet = new _Set(this._backing, this.root)
    this._patchTarget = newSet
    this._backing = null

    return newSet
  }

  _getBacking () {
    if (this._backing != null) {
      return this._backing
    }

    if (this.root.isLocked()) {
      throw new Error('unable to get backing - the set root is locked')
    }

    // to avoid stack overflow in cases where there's tons of patches to apply, we
    // don't implement this as a recursive function. instead we build up a stack
    // of sets that need to be given backings, and then work back down the stack
    // applying patches.
    let stack = _stackCache.remove()

    let target = this
    while (target != null) {
      stack.push(target)
      target = target._patchTarget
    }

    let backed = stack.pop()
    while (stack.size > 0) {
      let unbacked = stack.pop()
      unbacked._patchFunc(backed._backing, unbacked._i)

      // invert the situation so that the previously-backed set now points at the
      // previously-unbacked set and can recover its backing
      unbacked._backing = backed._backing
      backed._patchTarget = unbacked
      backed._patchFunc = unbacked._patchFunc.inverse
      backed._i = unbacked._i

      backed._backing = null
      unbacked._patchTarget = null
      unbacked._patchFunc = null
      unbacked._i = null

      backed = unbacked
    }

    _stackCache.add(stack)
    return this._backing
  }
}

