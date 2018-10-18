import { emptyMapInstance } from './_EmptyMap'
import { formatObj } from '../util'
import MapObserverWrapper from './MapObserverWrapper'
import _MutableStack from '../mutable/_MutableStack'
import _MutablePool from '../mutable/_MutablePool'
import deletePatch from './deletePatch'
import insertPatch from './insertPatch'
import updatePatch from './updatePatch'
import ImmyList from '../list'
import ImmySet from '../set'

let _stackCache = new _MutablePool(() => new _MutableStack())

class MapRoot {
  constructor () {
    this.lockCount = 0
  }

  lock () {
    this.lockCount++
  }

  unlock () {
    if (this.lockCount === 0) {
      throw new Error('attempting to unlock an already unlocked root')
    }

    this.lockCount--
  }

  isLocked () {
    return this.lockCount > 0
  }
}

export default class _Map {
  // the given backing will *not* be copied.
  // this constructor is not suitable for use externally.
  constructor (backing, root) {
    this._backing = backing
    this.size = backing.size // size is a public API
    this.root = root || new MapRoot() // root is a public API

    // on lists it makes sense to keep this._i as a number as
    // it will always be a number - for maps we don't know what
    // the key type will be to this._i is treated like the other
    // parameters
    this._i = null
    this._x = null
    this._y = null
    this._patchFunc = null
    this._patchTarget = null
  }

  _ensureUnlocked () {
    if (this.root.isLocked()) {
      throw new Error('unable to create new versions of a locked map')
    }
  }

  clear () {
    return emptyMapInstance
  }

  set (key, value) {
    const existingValue = this.get(key)

    // if existingValue is undefined, it might mean that we don't have
    // anything with that key. OR, it might mean that we've actually
    // associated undefined as the value for the key!

    if (existingValue === undefined) {
      if (value === undefined) {
        return this
      } else if (this.has(key)) {
        return this._withPatch(updatePatch, key, existingValue, value)
      } else {
        return this._withPatch(insertPatch, key, value, null)
      }
    } else if (existingValue === value) {
      return this
    } else {
      return this._withPatch(updatePatch, key, existingValue, value)
    }
  }

  get (key) {
    return this._getBacking().get(key)
  }

  has (key) {
    return this._getBacking().has(key)
  }

  delete (key) {
    const existingValue = this.get(key)

    if (existingValue !== undefined || this.has(key)) {
      if (this.size === 1) {
        return emptyMapInstance
      }

      return this._withPatch(deletePatch, key, existingValue, null)
    } else {
      return this
    }
  }

  update (key, func) {
    return this.set(key, func(this.get(key)))
  }

  toArray () {
    throw new Error('not done yet')
  }

  map (mapper, thisVal) {
    let mapped = new Map()

    for (let [key, value] of this) {
      mapped.set(key, mapper.call(thisVal, value, key, this))
    }

    return new _Map(mapped)
  }

  forEach (sideEffect, thisVal) {
    let i = 0
    for (let [key, value] of this) {
      if (sideEffect.call(thisVal, value, key, this) === false) {
        return i
      }

      ++i
    }

    return this.size
  }

  filter (predicate, thisVal) {
    let filtered = new Map()

    for (let [key, value] of this) {
      if (predicate.call(thisVal, value, key, this)) {
        filtered.set(key, value)
      }
    }

    return new _Map(filtered)
  }

  toList () {
    let values = []

    for (let [_, value] of this) {
      values.push(value)
    }

    return ImmyList(values, true)
  }

  toSet () {
    let values = []

    for (let [_, value] of this) {
      values.push(value)
    }

    return ImmySet(values)
  }

  toMap () {
    return this
  }

  toJS () {
    return new Map(this._getBacking())
  }

  * [Symbol.iterator] () {
    // iteration over maps/sets is a weakness of immy - you can't create
    // any new versions of the list while iterating over it.
    const backing = this._getBacking()
    this.root.lock()

    try {
      yield* backing
    } finally {
      this.root.unlock()
    }
  }

  // if an observer function returns false, the observation will immediately
  // stop and this method will return false. otherwise, the method returns true.
  observeChangesFor (otherMap, observer) {
    if (this === otherMap) {
      return true
    }

    const wrapper = new MapObserverWrapper(observer)

    if (otherMap === emptyMapInstance) {
      wrapper.clear(this._getBacking())
      return wrapper.active
    }

    if (this.root === otherMap.root) {
      // we can observe changes using patches. as the two maps share a
      // root, calling ensureBacking on the otherMap will cause this map
      // to have a patch trail leading directly toward the otherMap.
      //
      // this trail will turn the otherMap into this, but we want to go the
      // other way and look at the patches to turn this into the otherMap.
      // so, we invert the patches.)

      otherMap._getBacking()

      let map = this
      while (map !== otherMap && wrapper.active) {
        map._patchFunc.inverse.callWrapper(map._i, map._x, map._y, wrapper)
        otherMap._getBacking() // in case we do something that references the map and moves the backing
        map = map._patchTarget
      }
    } else {
      // clear everything and just add everything from the new map.
      wrapper.clear(this._getBacking())

      if (wrapper.active) {
        wrapper.insertMany(otherMap._getBacking())
      }
    }

    return wrapper.active
  }

  toString () {
    let str = `ImmyMap { `

    let first = true
    for (let [key, value] of this._getBacking()) {
      if (!first) {
        str += ', '
      }

      str += `${formatObj(key)}: ${formatObj(value)}`
      first = false
    }

    str += ' }'
    return str
  }

  inspect () {
    return this.toString()
  }

  _withPatch (patchFunc, key, x, y) {
    this._ensureUnlocked()
  
    patchFunc(this._getBacking(), key, x, y)

    this._i = key
    this._x = x
    this._y = y
    this._patchFunc = patchFunc.inverse

    const newMap = new _Map(this._backing, this.root)
    this._patchTarget = newMap
    this._backing = null

    return newMap
  }

  _getBacking () {
    if (this._backing != null) {
      return this._backing
    }

    if (this.root.isLocked()) {
      throw new Error('unable to get backing - the map root is locked')
    }

    // to avoid stack overflow in cases where there's tons of patches to apply, we
    // don't implement this as a recursive function. instead we build up a stack
    // of maps that need to be given backings, and then work back down the stack
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
      unbacked._patchFunc(backed._backing, unbacked._i, unbacked._x, unbacked._y)

      // invert the situation so that the previously-backed map now points at the
      // previously-unbacked map and can recover its backing
      unbacked._backing = backed._backing
      backed._patchTarget = unbacked
      backed._patchFunc = unbacked._patchFunc.inverse
      backed._i = unbacked._i
      backed._x = unbacked._x
      backed._y = unbacked._y

      backed._backing = null
      unbacked._patchTarget = null
      unbacked._patchFunc = null
      unbacked._i = null
      unbacked._x = null
      unbacked._y = null

      backed = unbacked
    }

    _stackCache.add(stack)
    return this._backing
  }
}

