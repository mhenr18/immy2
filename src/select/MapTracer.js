import WeakCache from '../helper/WeakCache'
import ImmyMap from '../map'

export default class MapTracer {
  constructor (name) {
    if (name == null) {
      name = 'MapTracer'
    }

    this.name = name
    this._cache = new WeakCache()
  }

  select (srcMap) {
    let oldSrcMap = this._cache.swap(srcMap.root, null)
    if (oldSrcMap == null) {
      console.log(`[${this.name}] (cache miss)`)
      oldSrcMap = ImmyMap()
    }

    oldSrcMap.observeChangesFor(srcMap, {
      insert: (k, v) => console.log(`[${this.name}] insert`, k, v),
      delete: (k, v) => console.log(`[${this.name}] delete`, k, v),
      set: (k, o, v) => console.log(`[${this.name}] set`, k, o, v)
    })
    
    this._cache.swap(srcMap.root, srcMap)
    return srcMap
  }
}
