import { emptyListInstance } from './_EmptyList'
import { formatObj, compareKeys } from '../util'
import ListObserverWrapper from './ListObserverWrapper'
import _MutableStack from '../mutable/_MutableStack'
import _MutableQueue from '../mutable/_MutableQueue'
import _MutablePool from '../mutable/_MutablePool'
import setOnePatch from './setOnePatch'
import setManyPatch from './setManyPatch'
import deletePatch from './deletePatch'
import insertPatch from './insertPatch'
import pushOnePatch from './pushOnePatch'
import pushManyPatch from './pushManyPatch'
import popOnePatch from './popOnePatch'
import popManyPatch from './popManyPatch'
import unshiftOnePatch from './unshiftOnePatch'
import unshiftManyPatch from './unshiftManyPatch'
import shiftOnePatch from './shiftOnePatch'
import shiftManyPatch from './shiftManyPatch'
import growPatch from './growPatch'
import splicePatch from './splicePatch'
import deleteManySparsePatch from './deleteManySparsePatch'

const identitySelector = (x) => x

// we cache the temporary data structures used in order to save memory.
// these caches are implemented as pools to ensure that all methods
// are re-entrant  (when a method is using something, it will remove
// it from the pool, and when it's done it will add it back. if the method
// re-enters then a new object will be created if needed).
let _stackCache = new _MutablePool(() => new _MutableStack())
let _queueCache = new _MutablePool(() => new _MutableQueue())
let _changeCache = new _MutablePool(() => ({ index: -1, value: null }))

export default class _List {

  // the given backing will *not* be copied.
  // this constructor is not suitable for use externally.
  constructor (backing, root) {
    this._backing = backing
    this.size = backing.length // size is a public API
    this.root = root || {} // root is a public API

    // there's a 24 byte cost per object (on V8, at least - other engines will
    // almost certainly have similar overheads). because of this, it is more
    // efficient from a memory perspective to inline the required patch as
    // properties on this object rather than allocating a seperate patch object.
    //
    // (it is somewhat more expensive to copy the extra properties when applying
    // patches, however we apply patches less often than we create new instances
    // so saving memory is considered more important)
    this._i = -1
    this._x = null
    this._y = null
    this._patchFunc = null
    this._patchTarget = null
  }

  // for compatibility with immutable js
  count () {
    return this.size
  }

  first () {
    return this.get(0)
  }

  last () {
    return this.get(this.size - 1)
  }

  set (index, value) {
    if (index < 0) {
      index = this.size + index // equivalent of this.size - Math.abs(index)
    }

    if (index < 0) {
      // this supports compatibility with Immutable's handling of negative
      // indexes, e.g:
      //
      // List(['a', 'b', 'c']).set(-6, 'x') 
      //    == List(['x', undefined, undefined, 'a', 'b', 'c'])

      let unshiftManyArgs = new Array(Math.abs(index))
      unshiftManyArgs[0] = value

      return this._withPatch(unshiftManyPatch, 0, unshiftManyArgs, null)
    } else if (index === this.size) {
      return this.push(value)
    } else if (index < this.size) {
      if (this.get(index) === value) {
        return this
      }
      
      return this._withPatch(setOnePatch, index, this._getBacking()[index], value)
    } else {
      return this.setSize(index + 1).set(index, value)
    }
  }

  get (index) {
    if (index < 0) {
      index = this.size + index // equivalent of this.size - Math.abs(index)
    }

    if (index < 0 || index >= this.size) {
      return undefined
    }

    return this._getBacking()[index]
  }

  delete (index) {
    if (index < 0) {
      index = this.size + index
    }

    if (index <= 0) {
      return this.shift()
    } else if (index >= this.size) {
      return this.pop()
    } else {
      return this._withPatch(deletePatch,
        index, this._getBacking()[index], null)
    }
  }

  insert (index, value) {
    if (index < 0) {
      index = this.size + index
    }

    if (index <= 0) {
      return this.unshift(value)
    } else if (index >= this.size) {
      return this.push(value)
    } else {
      return this._withPatch(insertPatch, index, value, null)
    }
  }

  // assumes that the list is already sorted (or empty is OK), and inserts the value into
  // the appropriate place using a binary search to find the insertion point. the keySelector
  // can be used when the list is holding complex object which are sorted by a particular key.
  insertSorted (value, keySelector) {
    if (keySelector === undefined) {
      keySelector = identitySelector
    }

    const valueKey = keySelector(value)
    const insertionIndex = this.binaryFindInsertionIndexByKey(valueKey, keySelector)

    return this.insert(insertionIndex, value)
  }

  // updates an existing item that has the same key as the new value. this throws if there isn't
  // an existing value with the same key
  updateSorted (value, keySelector) {
    if (keySelector === undefined) {
      keySelector = identitySelector
    }

    const updateIndex = this.indexOfSorted(value, keySelector)
    if (updateIndex < 0) {
      throw new Error('unable to update the given value - it is not in the list')
    }

    return this.set(updateIndex, value)
  }

  // throws if the value is not in the list
  deleteSorted (value, keySelector) {
    if (keySelector === undefined) {
      keySelector = identitySelector
    }

    const deletionIndex = this.indexOfSorted(value, keySelector)
    if (deletionIndex < 0) {
      throw new Error('unable to delete the given value - it is not in the list')
    }

    return this.delete(deletionIndex)
  }

  indexOfSorted (value, keySelector) {
    if (keySelector === undefined) {
      keySelector = identitySelector
    }

    const valueKey = keySelector(value)
    return this.binaryFindIndexByKey(valueKey, keySelector)
  }

  indexOf (value) {
    const backing = this._getBacking()
    for (let i = 0; i < backing.length; ++i) {
      if (backing[i] === value) {
        return i
      }
    }

    return -1
  }

  binaryFindByKey (targetKey, keySelector, notSetValue) {
    const index = this.binaryFindIndexByKey(targetKey, keySelector)

    if (index < 0) {
      return notSetValue
    } else {
      return this.get(index)
    }
  }

  // the comparator is *always* called with the target as the first argument.
  // (this means that it's possible to compare disjoint types)
  binaryFindIndex (target, comparator) {
    let minIndex = 0
    let maxIndex = this.size - 1
    let currentIndex
    let currentElement
    
    if (this.size === 0) {
      return -1
    }

    while (minIndex <= maxIndex) {
      currentIndex = (minIndex + maxIndex) / 2 | 0
      currentElement = this.get(currentIndex)

      let res = comparator(target, currentElement)

      if (res > 0) {
        minIndex = currentIndex + 1
      } else if (res < 0) {
        maxIndex = currentIndex - 1
      } else {
        // make sure that we return the index of the value that's at the end
        // of the sequence
        while (currentIndex < this.size - 1 && comparator(target, this.get(currentIndex + 1)) === 0) {
          ++currentIndex
        }

        return currentIndex
      }
    }

    if (maxIndex >= 0 && maxIndex < this.size && comparator(target, this.get(maxIndex)) === 0) {
      return maxIndex
    }

    if (minIndex >= 0 && minIndex < this.size && comparator(target, this.get(minIndex)) === 0) {
      return minIndex
    }

    return -1
  }

  // uses binary search to find the index of the desired value, assuming the list is sorted.
  // the keySelector is used to map values into their ordered key, which needs to be comparable
  // using the < operator and equatable using the === operator
  binaryFindIndexByKey (targetKey, keySelector) {
    if (keySelector === undefined) {
      keySelector = identitySelector
    }

    return this.binaryFindIndex(targetKey, (targetKey, value) => compareKeys(targetKey, keySelector(value)))
  }

  // the comparator is *always* called with the target as the first argument.
  // (this means that it's possible to compare disjoint types)
  binaryFindInsertionIndex (target, comparator) {
    if (this.size === 0) {
      return 0
    }

    let minIndex = 0
    let maxIndex = this.size - 1
    let currentIndex
    let currentElement

    while (minIndex <= maxIndex) {
      currentIndex = (minIndex + maxIndex) / 2 | 0
      currentElement = this.get(currentIndex)

      let res = comparator(target, currentElement)

      if (res > 0) {
        minIndex = currentIndex + 1
      } else if (res < 0) {
        maxIndex = currentIndex - 1
      } else {
        // found an identical value, go to the end of the sequence and then
        // return the index that's one after that
        while (currentIndex < this.size - 1 && comparator(target, this.get(currentIndex + 1)) == 0) {
          ++currentIndex
        }

        return currentIndex + 1
      }
    }

    var res = comparator(target, this.get(currentIndex))
    if (res < 0) {
      // need to insert a value that will be before the current one, so use its
      // index
      return currentIndex
    } else {
      // we want to insert after this value
      return currentIndex + 1
    }
  }

  // same as binaryFindIndex, except this never returns -1. Instead, it returns the index
  // that you should insert the target value so that the list stays sorted.
  binaryFindInsertionIndexByKey (targetKey, keySelector) {
    if (keySelector === undefined) {
      keySelector = identitySelector
    }

    return this.binaryFindInsertionIndex(targetKey, (targetKey, value) => compareKeys(targetKey, keySelector(value)))
  }

  clear () {
    return emptyListInstance
  }

  push (/* values */) {
    if (arguments.length === 0) {
      return this
    } else if (arguments.length === 1) {
      return this._withPatch(pushOnePatch, this.size, arguments[0], null)
    } else {
      const values = new Array(arguments.length)
      for (let i = 0; i < arguments.length; ++i) {
        values[i] = arguments[i]
      }

      return this._withPatch(pushManyPatch, this.size, values, null)
    }
  }

  pop () {
    if (this.size <= 1) {
      return emptyListInstance
    } else {
      const newSize = this.size - 1
      return this._withPatch(popOnePatch,
        newSize, this._getBacking()[newSize], null)
    }
  }

  popMany (deleteCount) {
    if (deleteCount === 0) {
      return this
    } if (this.size - deleteCount <= 0) {
      return emptyListInstance
    } else if (deleteCount === 1) {
      return this.pop()
    } else {
      const backing = this._getBacking()
      const itemsToPop = new Array(deleteCount)
      const offset = backing.length - deleteCount
      
      for (let i = 0; i < deleteCount; ++i) {
        itemsToPop[i] = backing[offset + i]
      }

      return this._withPatch(popManyPatch, offset, itemsToPop, null)
    }
  }

  unshift (/* values */) {
    if (arguments.length === 0) {
      return this
    } else if (arguments.length === 1) {
      return this._withPatch(unshiftOnePatch, 0, arguments[0], null)
    } else {
      const values = new Array(arguments.length)
      for (let i = 0; i < arguments.length; ++i) {
        values[i] = arguments[i]
      }

      return this._withPatch(unshiftManyPatch, 0, values, null)
    }
  }

  shift () {
    if (this.size <= 1) {
      return emptyListInstance
    } else {
      return this._withPatch(shiftOnePatch, 0, this._getBacking()[0], null)
    }
  }

  shiftMany (deleteCount) {
    if (deleteCount === 0) {
      return this
    } else if (this.size - deleteCount <= 0) {
      return emptyListInstance
    } else if (deleteCount === 1) {
      return this.shift()
    } else {
      const backing = this._getBacking()
      const itemsToShift = new Array(deleteCount)

      for (let i = 0; i < deleteCount; ++i) {
        itemsToShift[i] = backing[i]
      }
      
      return this._withPatch(shiftManyPatch, 0, itemsToShift, null)
    }
  }

  setSize (newSize) {
    if (newSize === 0) {
      return emptyListInstance
    } else if (newSize === this.size) {
      return this
    } else if (newSize < this.size) {
      return this.splice((this.size - newSize) + 1)
    } else {
      return this._withPatch(growPatch, this.size, newSize, null)
    }
  }

  splice (/* arguments */) {
    if (arguments.length === 0) {
      return this
    }
    
    // we update the arguments object here so that we can pass it directly to
    // Array.splice.
    let index = arguments[0]
    if (index < 0) {
      index = Math.max(this.size + index, 0)
      arguments[0] = index
    } else if (index >= this.size) {
      index = this.size
      arguments[0] = index
    }

    let deleteCount = this.size - index
    if (arguments.length >= 2) {
      deleteCount = Math.min(arguments[1], this.size - index)
      arguments[1] = deleteCount
    }

    // this function exists as a wrapper to actually splicing. in many cases, it's
    // possible to get the same outcome without needing to splice, and we can use
    // push/pop/etc instead. this is nicer from an observer's point of view as
    // they don't need to do these checks to enable more optimizations.
    //
    // this blows out the complexity of this method to absurd levels, but the
    // optimizations this allows vastly overshadow the increased cost of splicing.
    
    if (arguments.length <= 2 && deleteCount === 0) {
      return this

    } else if (arguments.length <= 2 && deleteCount > 0) {
      // removals only
      if (index === 0 && deleteCount === this.size) {
        return emptyListInstance
      } else if (index + deleteCount === this.size) {
        return this.popMany(deleteCount)
      } else if (index === 0) {
        return this.shiftMany(deleteCount)
      } else {
        return this._spliceImpl.apply(this, arguments)
      }

    } else if (arguments.length > 2 && deleteCount === 0) {
      // insertions only
      if (arguments.length === 3) {
        if (index >= this.size) {
          return this.push(arguments[2])
        } else if (index <= 0) {
          return this.unshift(arguments[2])
        } else {
          return this.insert(index, arguments[2])
        }
      } else {
        if (index <= 0 || index >= this.size) {
          const values = new Array(arguments.length - 2)
          for (let i = 2; i < arguments.length; ++i) {
            values[i - 2] = arguments[i]
          }

          if (index <= 0) {
            return this._withPatch(unshiftManyPatch, 0, values, null)
          } else {
            return this._withPatch(pushManyPatch, this.size, values, null)
          }
        } else {
          return this._spliceImpl.apply(this, arguments)
        }
      }

    } else if (arguments.length > 2 && arguments.length - 2 === deleteCount) {
      // replacement, don't need to change the size of the list
      if (deleteCount === 1) {
        return this.set(index, arguments[2])
      } else {
        const backing = this._getBacking()
        const oldValues = new Array(deleteCount)
        for (let i = 0; i < deleteCount; ++i) {
          oldValues[i] = backing[index + i]
        }

        // we look for an optimization here where we're replacing everything with
        // the same values, so that we can do nothing if possible

        let couldReturnThis = true
        const newValues = new Array(arguments.length - 2)
        for (let i = 0; i < arguments.length - 2; ++i) {
          newValues[i] = arguments[i + 2]

          if (oldValues[i] !== newValues[i]) {
            couldReturnThis = false
          }
        }

        if (couldReturnThis) {
          return this
        } else {
          return this._withPatch(setManyPatch, index, oldValues, newValues)
        }
      }

    } else {
      // insertions and removals.
      // there are potentially some more optimizations we could do here
      return this._spliceImpl.apply(this, arguments)
    }
  }

  toArray () {
    return this._getBacking().slice()
  }

  toJS () {
    return this.toArray()
  }

  find (predicate, thisVal, notSetValue) {
    for (let i = 0; i < this.size; ++i) {
      const value = this.get(i)
      if (predicate.call(thisVal, value, i, this)) {
        return value
      }
    }

    return notSetValue
  }

  findIndex (predicate, thisVal) {
    for (let i = 0; i < this.size; ++i) {
      if (predicate.call(thisVal, this.get(i), i, this)) {
        return i
      }
    }

    return -1
  }

  * [Symbol.iterator]() {
    for (let i = 0; i < this.size; ++i) {
      yield this.get(i)
    }
  }

  forEach (sideEffect, thisVal) {
    for (let i = 0; i < this.size; ++i) {
      if (sideEffect.call(thisVal, this.get(i), i, this) === false) {
        return i
      }
    }

    return this.size
  }

  // always returns a new disjoint List instance that cannot be efficiently compared
  // to the original instance
  map (mapper, thisVal) {
    let newBacking = new Array(this.size)

    for (let i = 0; i < this.size; ++i) {
      const existingValue = this.get(i)
      newBacking[i] = mapper.call(thisVal, existingValue, i, this)
    }
    
    return new _List(newBacking)
  }

  // same as map, but only supports a mapper that's f(x) rather than f(x, i, this).
  pureMap (mapper) {
    let newBacking = new Array(this.size)

    for (let i = 0; i < this.size; ++i) {
      newBacking[i] = mapper(this.get(i))
    }

    return new _List(newBacking)
  }

  // identical to map() in terms of arguments and immutability semantics, however
  // mapInPlace performs the mapping operation as a series of set() operations on
  // this list so that the returned list will be efficiently comparable to the
  // original instance.
  //
  // it only makes sense to use mapInPlace() if your mapper function will return
  // the existing value in the majority case.
  //
  // there is a performance trade-off - you get efficient comparison but lose the
  // ability to efficiently use the original list and the mapped list at the same
  // time.
  mapInPlace (mapper, thisVal) {
    // because the mapper function might reference the list, it's more efficient
    // to first create a queue of changes to be applied and then apply them after
    // we've finished calling the mapper.
    
    let changes = _queueCache.remove()

    // get the required changes
    for (let i = 0; i < this.size; ++i) {
      const existingValue = this.get(i)
      const mappedValue = mapper.call(thisVal, existingValue, i, this)

      if (mappedValue !== existingValue) {
        let change = _changeCache.remove()
        change.index = i
        change.value = mappedValue

        changes.push(change)
      }
    }

    // and apply them
    let newList = this

    while (changes.size > 0) {
      const change = changes.shift()

      newList = newList.set(change.index, change.value)

      change.index = -1
      change.value = null
      _changeCache.add(change)
    }

    _queueCache.add(changes)
    return newList
  }

  filter (predicate, thisVal) {
    let newBacking = new Array(this.size)
    let nextIndex = 0

    for (let i = 0; i < this.size; ++i) {
      const existingValue = this.get(i)

      if (predicate.call(thisVal, existingValue, i, this)) {
        newBacking[nextIndex++] = existingValue
      }
    }
    
    newBacking.length = nextIndex

    if (newBacking.length === 0) {
      return emptyListInstance
    }

    return new _List(newBacking)
  }

  // same concept as mapInPlace - the returned list is comparable to the original.
  filterInPlace (predicate, thisVal) {
    let removedIndexes = null
    let removedValues = null

    // get the required changes
    let i = 0
    for (; i < this.size; ++i) {
      const existingValue = this.get(i)

      if (!predicate.call(thisVal, existingValue, i, this)) {
        removedIndexes = [i]
        removedValues = [existingValue]
        ++i
        break
      }
    }

    // break out into a second loop that doesn't have to null check
    for (; i < this.size; ++i) {
      const existingValue = this.get(i)

      if (!predicate.call(thisVal, existingValue, i, this)) {
        removedIndexes.push(i)
        removedValues.push(existingValue)
      }
    }

    if (removedIndexes == null) {
      return this
    }

    if (removedIndexes.length === this.size) {
      return emptyListInstance
    }

    // and apply them in a single patch (this is O(n))
    return this._withPatch(deleteManySparsePatch, -1, removedIndexes, removedValues)
  }

  reduce (reducer, initialValue, thisVal) {
    let value = initialValue
    let i = 0
    if (arguments.length === 1) {
      value = this.get(0)
      i = 1
    }

    for (; i < this.size; ++i) {
      value = reducer.call(thisVal, value, this.get(i), i, this)
    }

    return value
  }

  // if an observer function returns false, the observation will immediately
  // stop and this method will return false. otherwise, the method returns true.
  observeChangesFor (otherList, observer) {
    if (this === otherList) {
      return true
    }

    const wrapper = new ListObserverWrapper(observer)

    if (otherList === emptyListInstance) {
      wrapper.clear(this._getBacking())
      return wrapper.active
    }

    if (this.root === otherList.root) {
      // we can observe changes using patches. as the two lists share a
      // root, calling ensureBacking on the otherList will cause this list
      // to have a patch trail leading directly toward the otherList.
      //
      // this trail will turn the otherList into this, but we want to go the
      // other way and look at the patches to turn this into the otherList.
      // so, we invert the patches.)

      otherList._getBacking()

      let list = this
      while (list !== otherList && wrapper.active) {
        list._patchFunc.inverse.callWrapper(list._i, list._x, list._y, wrapper)
        otherList._getBacking() // in case we do something that references the list and moves the backing
        list = list._patchTarget
      }
    } else {
      // clear everything and just add everything from the new list.
      wrapper.clear(this._getBacking())

      if (wrapper.active) {
        wrapper.pushMany(0, otherList._getBacking())
      }
    }

    return wrapper.active
  }

  toString () {
    if (this.size < 13) {
      return `ImmyList(${this.size}) [ `
      + this._getBacking().map(x => formatObj(x)).join(', ')
      + ' ]'
    } else {
      let str = `ImmyList(${this.size}) [ `

      for (let i = 0; i < 10; ++i) {
        if (i > 0) {
          str += ', '
        }

        str += formatObj(this.get(i))
      }

      str += `, ... , ${formatObj(this.get(-2))}, ${formatObj(this.get(-1))} ]`

      return str
    }
  }

  inspect () {
    return this.toString()
  }

  _withPatch (patchFunc, index, x, y) {
    patchFunc(this._getBacking(), index, x, y)
    return this._afterPatch(patchFunc, index, x, y)
  }

  _afterPatch (patchFunc, index, x, y) {
    this._i = index
    this._x = x
    this._y = y
    this._patchFunc = patchFunc.inverse
    
    const newList = new _List(this._backing, this.root)
    this._patchTarget = newList
    this._backing = null

    return newList
  }

  _getBacking () {
    if (this._backing != null) {
      return this._backing
    }

    // to avoid stack overflow in cases where there's tons of patches to apply, we
    // don't implement this as a recursive function. instead we build up a stack
    // of lists that need to be given backings, and then work back down the stack
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

      // invert the situation so that the previously-backed list now points at the
      // previously-unbacked list and can recover its backing
      unbacked._backing = backed._backing
      backed._patchTarget = unbacked
      backed._patchFunc = unbacked._patchFunc.inverse
      backed._i = unbacked._i
      backed._x = unbacked._x
      backed._y = unbacked._y
      
      backed._backing = null
      unbacked._patchTarget = null
      unbacked._patchFunc = null
      unbacked._i = -1
      unbacked._x = null
      unbacked._y = null

      backed = unbacked
    }

    _stackCache.add(stack)
    return this._backing
  }

  _spliceImpl (/* arguments */) {
    // this is only ever called with sanitised arguments which are safe to pass
    // directly to Array.splice(), and there will always be at least 3 arguments
    const backing = this._getBacking()
    let removedValues = backing.splice.apply(backing, arguments)
    removedValues.unshift(arguments[0], arguments.length - 2)

    // removedValues is now the set of arguments needed to invert the splice

    // copy our args
    let args = new Array(arguments.length)
    for (let i = 0; i < arguments.length; ++i) {
      args[i] = arguments[i]
    }

    return this._afterPatch(splicePatch, arguments[0], args, removedValues)
  }
}
