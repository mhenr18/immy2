
// WeakMaps are great for caching purposes - your cached data will be
// automatically cleaned up by the GC if it's not being used elsewhere
// and the cache key goes out of use.
//
// The problem is in the case when the cache key doesn't go out of use
// for a long time - the WeakMap will keep holding a reference to the
// cached data. This data might use a lot of memory and in some circumstances
// it could be better to forget the cached data and recompute it.
//
// We solve this by using a LRU cache of WeakMaps that have only a single
// entry. This allows for cached object lifetimes shorter than the lifetime
// of the cache keys, as cached objects will be discarded when the WeakMap
// falls out of the LRU cache. (And because we're using WeakMaps, if the
// cache key goes out of use before the WeakMap falls out of cache, the GC
// will still clean up the cached data anyway)
//
// Note: Due to limitations on WeakMaps, you can't use primitive values
// (anything except Objects/Functions/Arrays) as keys in _WeakLruCaches.
//
// To prevent issues where the cache is holding onto a reference that's blowing
// up memory in the interim between getting the cached value and setting a new
// cached value, you can't get a cached entry without replacing it with something
// else.

export default class _WeakLruCache {
  constructor (maxSize = 8) {
    this._maxSize = maxSize
    this._weakMaps = []
  }

  clear () {
    this._weakMaps = []
  }

  // returns the old value (undefined if the key wasn't part of the cache)
  swap (key, newValue) {
    let weakMap = null
    let oldValue = undefined

    for (let i = 0; i < this._weakMaps.length; ++i) {
      oldValue = this._weakMaps[i].get(key)
      
      if (oldValue !== undefined) {
        weakMap = this._weakMaps[i]
        this._weakMaps.splice(i, 1)
        break
      }
    }

    if (weakMap == null) {
      weakMap = new WeakMap()
    }

    weakMap.set(key, newValue)
    this._weakMaps.unshift(weakMap)

    // drop least recently used items out of the cache
    if (this._weakMaps.length >= this._maxSize) {
      this._weakMaps.length = this._maxSize
    }

    return oldValue
  }
}
