import WeakCache from '../helper/WeakCache'
import ImmyList from '../list'
import { compareKeys } from '../util'

// very similar to OrderBy, but instead takes a comparator that returns -ve, 0, +ve
// values directly to allow for more powerful user-defined sorts

export default class SortSelector {
  constructor (comparator) {
    if (comparator == null) {
      comparator = compareKeys
    }

    this.comparator = comparator
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
      arr.sort(this.comparator)

      oldOrderedList = ImmyList(arr, true)
    } else {
      oldSrcList.observeChangesFor(srcList, {
        insert: (i, x) => {
          const insertIndex = oldOrderedList.binaryFindInsertionIndex(x, this.comparator)
          oldOrderedList = oldOrderedList.insert(insertIndex, x)
        },
        delete: (i, x) => {
          const deleteIndex = oldOrderedList.binaryFindIndex(x, this.comparator)
          oldOrderedList = oldOrderedList.delete(deleteIndex)
        }
      })
    }

    this._cache.swap(srcList.root, { oldSrcList: srcList, oldOrderedList })
    return oldOrderedList
  }
}
