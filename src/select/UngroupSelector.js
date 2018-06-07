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

    oldSrcMap.observeChangesFor(srcMap, {
      insert: (key, group) => {
        let groupIndexOffset = oldUngroupedList.size
        oldIndexOffsetMap.set(key, groupIndexOffset)

        for (let v of group) {
          oldUngroupedList = oldUngroupedList.push(this.ungrouper(v, key))
        }
      },
      delete: (key, group) => {
        let offset = oldIndexOffsetMap.get(key)
        let delta = -group.size
        oldUngroupedList = oldUngroupedList.splice(offset, group.size)

        oldIndexOffsetMap.delete(key)

        for (let [k, value] of oldIndexOffsetMap) {
          if (value > offset) {
            oldIndexOffsetMap.set(k, value + delta)
          }
        }
      },
      set: (key, oldGroup, newGroup) => {
        const offset = oldIndexOffsetMap.get(key)
        oldGroup.observeChangesFor(newGroup, {
          insert: (i, v) => {
            oldUngroupedList = oldUngroupedList.insert(offset + i, this.ungrouper(v, key))
          },
          delete: (i, _) => {
            oldUngroupedList = oldUngroupedList.delete(offset + i)
          }
        })

        if (newGroup.size === 0) {
          oldIndexOffsetMap.delete(key)
        }

        let delta = newGroup.size - oldGroup.size
        for (let [k, value] of oldIndexOffsetMap) {
          if (value > offset) {
            oldIndexOffsetMap.set(k, value + delta)
          }
        }
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
