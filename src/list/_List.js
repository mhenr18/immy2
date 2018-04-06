import { emptyListInstance } from './_EmptyList'
import _MutableStack from '../mutable/_MutableStack'
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
import { formatObj } from '../util';

class ListRoot {}

let _getBackingStack = new _MutableStack()

export default class _List {

  // the given backing will *not* be copied.
  // this constructor is not suitable for use externally.
  constructor (backing, root) {
    this._backing = backing
    this.size = backing.length // size is a public API
    this._root = root || new ListRoot()

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

  expand () {
    return this
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

  pureMap (mapper) {
    throw new Error('pureMap is not implemented yet')
  }

  pureFilter (predicate) {
    throw new Error('pureFilter is not implemented yet')
  }

  pureReduce (reducer, initialValue) {
    throw new Error('pureReduce is not implemented yet')
  }

  observeChangesFor (otherList, observer) {
    throw new Error('observeChangesFor is not implemented yet')
  }

  toString () {
    return 'ImmyList [ ' + this._getBacking().map(x => formatObj(x)).join(', ') + ' ]'
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
    
    const newList = new _List(this._backing, this._root)
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
    //
    // we cache this stack for use between calls to improve performance. (this is
    // done in an exception-safe manner)

    // claim the cached stack and null the cache out, so that if there's any bugs
    // in the patching process that throw exceptions, future calls will throw a
    // null reference exception instead of silently breaking
    let stack = _getBackingStack
    _getBackingStack = null

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

    // we're all safely done, we can return the empty stack to the cache
    _getBackingStack = stack

    return this._backing
  }

  _spliceImpl (/* arguments */) {
    console.log('_spliceImpl', arguments)

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
