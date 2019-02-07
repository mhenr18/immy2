import WeakCache from '../helper/WeakCache'
import ImmyMap from '../map'

export default class MapMapSelector {

  constructor (mapper) {
    // this.mapper is public API for the optimizer
    this.mapper = mapper

    this._cache = new WeakCache(2)
  }

  select (srcMap) {
    if (srcMap.size === 0) {
      return srcMap
    }

    let cacheEntry = this._cache.swap(srcMap.root, null)
    if (cacheEntry != null) {
      let oldSrcMap = cacheEntry.srcMap
      let mappedMap = cacheEntry.mappedMap
      cacheEntry = null

      oldSrcMap.observeChangesFor(srcMap, {
        insert: (k, v) => (mappedMap = mappedMap.set(k, this.mapper(v))),
        delete: (k, v) => (mappedMap = mappedMap.delete(k)),
        set: (k, _, v) => (mappedMap = mappedMap.set(k, this.mapper(v)))
      })

      // update our cache
      cacheEntry = { srcMap, mappedMap }
      this._cache.swap(srcMap.root, cacheEntry)

      return mappedMap
    }

    let mapped = new Map()
    for (let [key, value] of srcMap) {
      mapped.set(key, this.mapper(value))
    }

    let mappedMap = ImmyMap(mapped, true)
    cacheEntry = { srcMap, mappedMap }
    this._cache.swap(srcMap.root, cacheEntry)

    return mappedMap
  }
}
