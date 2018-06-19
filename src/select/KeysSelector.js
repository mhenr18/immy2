import ImmyMap from '../map'
import ImmyList from '../list'
import WeakCache from '../helper/WeakCache'

export default class KeysSelector {
  constructor () {
    this._cache = new WeakCache()
  }

  select (srcMap) {
    let { 
      oldSrcMap,
      oldKeysList
    } = this._cache.swap(srcMap.root, null, () => ({
      oldSrcMap: ImmyMap(),
      oldKeysList: ImmyList()
    }))

    oldSrcMap.observeChangesFor(srcMap, {
      insert: (key, _) => {
        oldKeysList = oldKeysList.push(key)
      },
      delete: (key, _) => {
        const index = oldKeysList.indexOf(key)
        if (index < 0) {
          throw new Error('unable to find index of key')
        }

        oldKeysList = oldKeysList.delete(index)
      },
      set: (key, oldValue, newValue) => {
        // do nothing, the key stays the same
      }
    })

    this._cache.swap(srcMap.root, {
      oldSrcMap: srcMap,
      oldKeysList
    })

    return oldKeysList
  }
}
