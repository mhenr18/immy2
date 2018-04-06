const pushOnePatch = require('./pushOnePatch')
const pushManyPatch = require('./pushManyPatch')
const popOnePatch = require('./popOnePatch')
const popManyPatch = require('./popManyPatch')
const removeManyPatch = require('./removeManyPatch')
const splicePatch = require('./splicePatch')
const growPatch = require('./growPatch')
const setPatch = require('./setPatch')
const MutationHandlerWrapper = require('./MutationHandlerWrapper')

// written using ES5 style code so that we don't need to be transpiled for
// use in any environment, we just need to be bundled. (Immy is small enough
// that there's no benefit to tree shaking as ES2015 modules)
//
// Immy is specifically *not* written to be beautiful and elegant. Immy is
// written to be fast, so that the users of immy can write beautiful and
// elegant code without compromise.
//
// if noCopy is passed, we blindly trust that the collection is an array,
// and that it's safe to treat it like one.
//
// if root is passed, we blindly trust it too.
//
// (client code should never know about the second and third arguments
// to the constructor)

function ImmyList (collection, noCopy, root) {
  if (noCopy) {
    this.backing = collection
    this.size = collection.length
  } else if (collection != null) {
    this.backing = []

    for (let value of collection) {
      this.backing.push(value)
    }

    this.size = this.backing.length
  } else {
    this.backing = []
    this.size = 0
  }

  this.patchSource = null
  this.patchFunc = null
  this.i = -1
  this.x = null
  this.y = null
  this.root = root || {
    mapPureCache: null
  }
}

ImmyList.prototype.push = function (/* ..values */) {
  if (arguments.length === 0) {
    return this
  }

  let backing = this.__ensureBacking()
  
  if (arguments.length === 1) {
    // push one special case (avoids an array allocation)
    this.x = arguments[0]
    backing.push(this.x)
    this.patchFunc = pushOnePatch.inverse
  } else {
    // push many general case
    const args = new Array(arguments.length)
    for (let i = 0; i < arguments.length; ++i) {
      args[i] = arguments[i]
    }
    
    this.x = args
    backing.push.apply(backing, args)
    this.patchFunc = pushManyPatch.inverse
  }

  const newList = new ImmyList(backing, true, this.root)
  this.backing = null
  this.patchSource = newList

  return newList
}

ImmyList.prototype.pop = function () {
  if (this.size === 0) {
    return this
  }

  const backing = this.__ensureBacking()
  this.x = backing[this.size - 1]
  this.patchFunc = popOnePatch.inverse
  backing.pop()

  const newList = new ImmyList(backing, true, this.root)
  this.backing = null
  this.patchSource = newList

  return newList
}

ImmyList.prototype.setSize = function (newSize) {
  if (newSize === this.size) {
    return this
  } else if (newSize <= 0) {
    // if we're clearing everything, this is a total sequence break
    // so there's no point tracking the changes
    return new ImmyList()
  }

  let backing = this.__ensureBacking()
  
  if (newSize < this.size) {
    // removing from the end case. this is effectively just a splice at the
    // end of the list, for the purposes of patching
    return this.splice((this.size - newSize) - 1)
  } else {
    // we're growing the list with undefineds
    this.x = backing.length
    backing.length = newSize
    this.i = newSize
    this.patchFunc = growPatch.inverse
  }

  const newList = new ImmyList(backing, true, this.root)
  this.backing = null
  this.patchSource = newList

  return newList
}

ImmyList.prototype.splice = function (index, removeNum, /* ...values */) {
  let backing = this.__ensureBacking()

  if (arguments.length === 0) {
    return this
  } else if (arguments.length === 1) {
    // removing everything from the index onwards
    if (index === 0) {
      return new ImmyList()
    } else {
      this.x = backing.splice(index)
      this.patchFunc = popManyPatch.inverse
    }
  } else if (arguments.length === 2) {
    if (index === 0 && removeNum === this.size) {
      return new ImmyList()
    } else if (index === this.size - removeNum) {
      this.x = backing.splice(index)
      this.patchFunc = popManyPatch.inverse
    } else {
      this.i = index
      this.x = removeNum
      const itemsBeingRemoved = backing.splice(index, removeNum)
      itemsBeingRemoved.unshift(index, 0)
      this.y = itemsBeingRemoved
      this.patchFunc = removeManyPatch.inverse
    }
  } else {
    if (index === 0 && removeNum === this.size) {
      const newItems = new Array(arguments.length - 2)
      for (let i = 2; i < arguments.length; ++i) {
        newItems[i - 2] = arguments[i]
      }

      return new ImmyList(newItems, true)
    } else {
      const elementsToRemove = backing.splice.apply(backing, arguments)
      elementsToRemove.unshift(index, arguments.length - 2)

      const args = new Array(arguments.length)
      for (let i = 0; i < arguments.length; ++i) {
        args[i] = arguments[i]
      }

      this.x = args
      this.y = elementsToRemove // args to undo the splice
      this.patchFunc = splicePatch.inverse
    }
  }

  const newList = new ImmyList(backing, true, this.root)
  this.backing = null
  this.patchSource = newList

  return newList
}

ImmyList.prototype.set = function (index, value) {
  if (index < 0) {
    index = this.size - index
  }

  if (index < 0) {
    throw new Error('index out of range')
  }

  let backing = this.__ensureBacking()

  if (index === this.size) {
    // index is out of bounds, but it's effectively a push which is cleaner than
    // a resize + a set (from a patching point of view)
    return this.push(value)
  } else if (index > this.size) {
    // this is a slow path because to ensure correctness with our patching
    // we have to first grow the list's size, *then* set the value.
    return this.setSize(index + 1).set(index, value)
  } else if (backing[index] === value) {
    // this *has* to come after the index-in-bounds check for size correctness
    // reasons (consider the case of list.set(outOfRangeIndex, undefined))
    return this
  }

  this.i = index
  this.x = value
  this.y = backing[index]
  backing[index] = value
  this.patchFunc = setPatch.inverse

  const newList = new ImmyList(backing, true, this.root)
  this.backing = null
  this.patchSource = newList

  return newList
}

ImmyList.prototype.get = function (index, notSetValue) {
  if (index < 0) {
    index = this.size - index
  }

  if (index >= this.size || index < 0) {
    return notSetValue // will be undefined if not supplied, which is perfect
  }

  this.__ensureBacking()
  return this.backing[index]
}

ImmyList.prototype.toArray = function () {
  return this.__ensureBacking().slice()
}

ImmyList.prototype.toJS = function () {
  return this.__ensureBacking().slice()
}

// mapPure() is unique to Immy, and allows Immy to internally optimize the mapping
// by reusing previous results so that in many cases, an O(n) mapping operation can
// be done in O(1) time.
//
// The mapper function should have the signature f(value) => newValue and *must*
// be a pure function which returns the same results given the same inputs.

ImmyList.prototype.mapPure = function (mapper) {
  // lookup our mapPure cache and see if there's any results for the supplied mapper
  // function. if there are, we can diff this list against the cache hit and that
  // will tell us how this list has changed since that mapping was made.
  if (this.root.mapPureCache == null) {
    this.root.mapPureCache = new WeakMap()
  }

  let cacheEntry = this.root.mapPureCache.get(mapper)

  if (cacheEntry == null) {
    // we need to compute the mapping from scratch. because the mapper is pure,
    // it can't depend on this. that allows us to do a fast iteration where we
    // just get the backing once and then assume it won't be stolen
    const backing = this.__ensureBacking()

    let mapping = null
    if (backing.length === 0) {
      mapping = new ImmyList()
    } else {
      let mappedBacking = new Array(backing.length)

      for (let i = 0; i < backing.length; ++i) {
        mappedBacking[i] = mapper(backing[i])
      }

      mapping = new ImmyList(mappedBacking, true)
    }

    // save this in the cache for later reuse
    this.root.mapPureCache.set(mapper, {
      srcList: this,
      mapping
    })

    return mapping
  }

  // we have a cache hit, update the mapping based on the diff between this
  // and the srcList of the cacheEntry
  let srcList = cacheEntry.srcList
  let mapping = cacheEntry.mapping

  if (srcList === this) {
    console.log('matching srcList')
    return mapping
  }

  // this ensures that in big cases, we keep no references to the old mapping
  // and cause an out of memory problem where all of the intermediate values of
  // the mapping get kept around when we don't need them
  cacheEntry = null
  this.root.mapPureCache.delete(mapper)

  srcList.getMutationsTo(this, {
    insert: (index, value) => {
      mapping = mapping.insert(index, mapper(value))
    },
    remove: (index, value) => {
      mapping = mapping.remove(index)
    },
    pushOne: (value) => {
      mapping = mapping.push(mapper(value))
    },
    popOne: (value) => {
      mapping = mapping.pop()
    },
    set: (index, value) => {
      mapping = mapping.set(index, value)
    }
  })

  // update the cache
  this.root.mapPureCache.set(mapper, {
    srcList: this,
    mapping
  })

  return mapping
}

// this exposes Immy's change-tracking mechanism as a public API, allowing
// you to get the mutations that will take this list and turn it into the
// otherList.
//
// at a minimum, you must implement insert() and remove() in your handler.
// you can choose to implement other methods for better performance if
// desired.
//
ImmyList.prototype.getMutationsTo = function (otherList, handler) {
  const wrapper = new MutationHandlerWrapper(handler)

  if (this === otherList) {
    return
  }

  if (this.root !== otherList.root) {
    // very simple case - non matching roots means that we clear out the old,
    // and insert in the new
    wrapper.clear(this)

    for (let i = 0; i < otherList.size; ++i) {
      wrapper.pushOne(i, otherList.get(i))
    }
  } else {
    // the two lists share the same root. this means that if we ensure the otherList
    // has a backing, this list's patches will point to the otherList and give us the
    // required mutations by looking at the inverse patches. (the patches are for otherList
    // to this, but we want to go from this to the otherList)

    otherList.__ensureBacking()

    let list = this
    while (list !== otherList) {
      list.patchFunc.inverse.callWrapper(list, list.patchSource, wrapper)
      otherList.__ensureBacking() // in case we do something that references the list and moves the backing
      list = list.patchSource
    }
  }
}

// after this returns, the list is guaranteed to have a backing array.
// we cache a targetsArray object to cut down on allocations - this more than
// halved the method's runtime in benchmarking.
let targetsArray = null

ImmyList.prototype.__ensureBacking = function () {
  if (this.backing != null) {
    return this.backing
  }

  if (!this.patchSource) {
    throw new Error('list has no backing and no patch source')
  }

  // first traverse out along the patch source chain to find a starting point
  // to apply patches from. because we don't store backreferences we need to
  // maintain a stack of targets to apply patches to
  let source = this.patchSource
  let targets = targetsArray
  targetsArray = null
  if (targets == null) {
    targets = [this]
  } else {
    targets[0] = this
  }
  
  let count = 1
  while (source.patchSource != null) {
    if (count >= targets.length) {
      targets.push(source)
    } else {
      targets[count] = source
    }

    source = source.patchSource
    ++count
  }

  // now work our way back down the stack and apply patches
  for (let j = count - 1; j >= 0; --j) {
    let target = targets[j]
    target.patchFunc(source.backing, source, target)
    source = target
  }

  // return the targets array to our cache, so that we can use it in the next call
  // and save allocations
  targetsArray = targets

  return this.backing
}

module.exports = ImmyList
