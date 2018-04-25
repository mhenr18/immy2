import _WeakLruCache from '../helper/_WeakLruCache'

// the reduce selector caches partial reductions at various points in the list.
// we strongly bias the caching towards the end of the list, as it's less valuable
// to be able to cache towards the start (as if you make a change at the start you
// have to recompute tons of data anyway, so the relative value of caching is less)

export default class ReduceNoInitialValueSelector {
  constructor (reducer) {
    // this.reducer is public API
    this.reducer = reducer

    this._cache = new _WeakLruCache(2)
  }

  select (srcList) {
    if (srcList.size === 0) {
      return undefined
    } else if (srcList.size === 1) {
      return srcList.get(0)
    }

    let cacheEntry = this._cache.swap(srcList.root, null)
    if (cacheEntry != null) {
      console.log('cache hit')

      let oldSrcList = cacheEntry.srcList
      let reductionCache = cacheEntry.reductionCache
      cacheEntry = null

      oldSrcList.observeChangesFor(srcList, {
        insert: (index, value) => {
          console.log('+', index, value)
        },

        delete: (index, value) => {
          console.log('-', index, value)
        }
      })

      // update our cache
      cacheEntry = { srcList, reductionCache }
      this._cache.swap(srcList.root, cacheEntry)

      return null
    }

    console.log('cache miss')

    let reduction = srcList.get(0)
    let nextCacheIndex = Math.floor(srcList.size / 2)
    let reductionCache = []

    for (let i = 1; i < srcList.size; ++i) {
      reduction = this.reducer(reduction, srcList.get(i))

      if (i >= nextCacheIndex) {
        reductionCache.push({ index: i, reduction })
        nextCacheIndex = Math.floor((i + (srcList.size - i) / 2))
      }
    }

    cacheEntry = { srcList, reductionCache }
    this._cache.swap(srcList.root, cacheEntry)
    return reduction
  }
}
