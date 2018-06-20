import WeakCache from '../helper/WeakCache'
import ImmyList from '../list'
import { compareKeys } from '../util'

export default class OrderBySelector {
  constructor (orderSelector) {
    this.orderSelector = orderSelector
    this._cache = new WeakCache()
  }

  select (srcList) {
    if (srcList.size === 0) {
      return srcList
    }

    let { oldSrcList, oldOrderedList } = this._cache.swap(srcList.root, null, () => ({
      oldSrcList: null,
      oldOrderedList: null
    }))

    // unlike some of the other selectors which are written to always diff, it's
    // massively more efficient to do a standard sort if we have nothing cached as
    // orderBy() is effectively an insertion sort

    if (oldSrcList == null) {
      let arr = srcList.toArray()
      arr.sort((aValue, bValue) => {
        const a = this.orderSelector(aValue)
        const b = this.orderSelector(bValue)

        return compareKeys(a, b)
      })

      oldOrderedList = ImmyList(arr, true)
    } else {
      oldSrcList.observeChangesFor(srcList, {
        insert: (i, x) => {
          const insertIndex = oldOrderedList.binaryFindInsertionIndexByKey(this.orderSelector(x), this.orderSelector)
          oldOrderedList = oldOrderedList.insert(insertIndex, x)
        },
        delete: (i, x) => {
          const deleteIndex = oldOrderedList.binaryFindIndexByKey(this.orderSelector(x), this.orderSelector)
          oldOrderedList = oldOrderedList.delete(deleteIndex)
        }
      })
    }

    this._cache.swap(srcList.root, { oldSrcList: srcList, oldOrderedList })
    return oldOrderedList
  }
}
