import ImmyMap from '../map'
import WeakCache from '../helper/WeakCache'

export default class FilterByValueSelector {
  constructor (predicate) {
    this.predicate = predicate
    this._cache = new WeakCache()
  }

  select (srcMap) {
    let { 
      oldSrcMap,
      oldFilteredMap
    } = this._cache.swap(srcMap.root, null, () => ({
      oldSrcMap: ImmyMap(),
      oldFilteredMap: ImmyMap()
    }))

    oldSrcMap.observeChangesFor(srcMap, {
      insert: (key, newValue) => {
        if (this.predicate(newValue)) {
          oldFilteredMap = oldFilteredMap.set(key, newValue)
        }
      },
      delete: (key, oldValue) => {
        if (this.predicate(oldValue)) {
          oldFilteredMap = oldFilteredMap.delete(key)
        }
      },
      set: (key, oldValue, newValue) => {
        const op = this.predicate(oldValue)
        const np = this.predicate(newValue)

        if (op && !np) {
          oldFilteredMap = oldFilteredMap.delete(key)
        } else if (np) {
          oldFilteredMap = oldFilteredMap.set(key, newValue)
        }
      }
    })

    this._cache.swap(srcMap.root, {
      oldSrcMap: srcMap,
      oldFilteredMap
    })

    return oldFilteredMap
  }
}
