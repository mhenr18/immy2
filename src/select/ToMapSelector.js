import ImmyMap from '../map'
import ImmyList from '../list'
import WeakCache from '../helper/WeakCache'

export default class ToMapSelector {
  constructor () {
    this._cache = new WeakCache()
  }

  select (srcList) {
    if (srcList.size === 0) {
      return ImmyMap()
    }

    if (!Array.isArray(srcList.get(0)) || srcList.get(0).length != 2) {
      throw new Error('toMap() expects a list of [key, value] pairs as its input')
    }

    let { oldSrcList, oldMap } = this._cache.swap(srcList.root, null, () => ({
      oldSrcList: ImmyList(),
      oldMap: ImmyMap()
    }))

    oldSrcList.observeChangesFor(srcList, {
      insert: (i, x) => {
        oldMap = oldMap.set(x[0], x[1])
      },
      delete: (i, x) => {
        oldMap = oldMap.delete(x[0])
      }
    })

    this._cache.swap(srcList.root, { oldSrcList: srcList, oldMap })
    return oldMap
  }
}
