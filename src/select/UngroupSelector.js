import ImmyMap from '../map'
import ImmyList from '../list'
import WeakCache from '../helper/WeakCache'

export default class UngroupSelector {
  constructor (ungrouper) {
    if (ungrouper == null) {
      ungrouper = x => x
    }

    this.ungrouper = ungrouper
    this._cache = new WeakCache()
  }

  select (srcMap) {
    let { 
      oldSrcMap,
      oldUngroupedList,
      oldIndexOffsetMap
    } = this._cache.swap(srcMap.root, null, () => ({
      oldSrcMap: ImmyMap(),
      oldUngroupedList: ImmyList(),
      oldIndexOffsetMap: new Map()
    }))

    let setObserver = {
      insert: (_, value) => {

      },
      delete: (_, value) => {

      }
    }

    oldSrcMap.observeChangesFor(srcMap, {
      insert: (key, group) => {
        let groupIndexOffset = oldUngroupedList.size
        oldIndexOffsetMap.set(key, groupIndexOffset)

        for (let v of group) {
          oldUngroupedList = oldUngroupedList.push(v)
        }
      },
      delete: (key, group) => {
        let offset = oldIndexOffsetMap.get(key)
        let delta = group.size
        oldUngroupedList = oldUngroupedList.splice(offset, group.size)

        for (let [key, value] of oldIndexOffsetMap) {
          if (value > offset) {
            oldIndexOffsetMap.set(key, value - delta)
          }
        }
      },
      set: (key, oldGroup, newGroup) => {

      }
    })

    this._cache.swap(srcMap.root, {
      oldSrcMap: srcMap,
      oldUngroupedList,
      oldIndexOffsetMap
    })

    return oldUngroupedList
  }
}
