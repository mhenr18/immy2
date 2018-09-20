import ImmyMap from '../map'
import ImmyList from '../list'
import WeakCache from '../helper/WeakCache'

export default class ValuesSelector {
  constructor () {
    this._cache = new WeakCache()
  }

  select (srcMap) {
    let { 
      oldSrcMap,
      oldValuesList,
      oldIndexOffsetMap
    } = this._cache.swap(srcMap.root, null, () => ({
      oldSrcMap: ImmyMap(),
      oldValuesList: ImmyList(),
      oldIndexOffsetMap: new Map()
    }))

    oldSrcMap.observeChangesFor(srcMap, {
      insert: (key, value) => {
        let valueIndexOffset = oldValuesList.size
        oldIndexOffsetMap.set(key, valueIndexOffset)
        oldValuesList = oldValuesList.push(value)
      },
      delete: (key, _) => {
        let offset = oldIndexOffsetMap.get(key)
        let delta = -1
        oldValuesList = oldValuesList.splice(offset, 1)

        oldIndexOffsetMap.delete(key)

        for (let [k, value] of oldIndexOffsetMap) {
          if (value > offset) {
            oldIndexOffsetMap.set(k, value + delta)
          }
        }
      },
      set: (key, _, newValue) => {
        const offset = oldIndexOffsetMap.get(key)
        oldValuesList = oldValuesList.set(offset, newValue)
      }
    })

    this._cache.swap(srcMap.root, {
      oldSrcMap: srcMap,
      oldValuesList,
      oldIndexOffsetMap
    })

    return oldValuesList
  }
}
