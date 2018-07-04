import WeakCache from '../helper/WeakCache'
import List from '../list'

// note: filter on its own is slow due to having to do the required bookkeeping
// to insert things at the right places.

export default class FilterSelector {
  constructor (predicate) {
    this.predicate = predicate
    this._cache = new WeakCache()
  }

  select (srcList) {
    if (srcList.size === 0) {
      return srcList
    }

    let cacheEntry = this._cache.swap(srcList.root, null)
    if (cacheEntry != null) {
      let oldSrcList = cacheEntry.srcList
      let filteredList = cacheEntry.filteredList
      let translation = cacheEntry.translation
      cacheEntry = null

      oldSrcList.observeChangesFor(srcList, {
        insert: (index, value) => {
          // regardless of whether the new value passes the predicate, its
          // prescence requires us to update the translation table. this pass
          // also allows us to find the appropriate insertion point into the
          // filtered list
          let insertionPoint = -1
          for (let i = 0; i < translation.length; ++i) {
            if (translation[i] >= index) {
              if (insertionPoint < 0) {
                insertionPoint = i
              }

              translation[i] += 1
            }
          }

          if (insertionPoint < 0) {
            // need to insert at the end of the filtered list
            insertionPoint = translation.length
          }

          if (this.predicate(value)) {
            translation.splice(insertionPoint, 0, index)
            filteredList = filteredList.insert(insertionPoint, value)
          }
        },

        delete: (index, value) => {
          // need to update the translation table, and while we do this we
          // can find the deletion point (if needed)
          let deletionPoint = -1
          for (let i = 0; i < translation.length; ++i) {
            if (translation[i] >= index) {
              if (deletionPoint < 0) {
                deletionPoint = i
              }

              translation[i] -= 1
            }
          }

          if (this.predicate(value)) {
            if (deletionPoint < 0) {
              throw new Error('trying to delete from filtered list but could not find item to delete')
            }

            translation.splice(deletionPoint, 1)
            filteredList = filteredList.delete(deletionPoint)
          }
        },

        push: (value, index) => {
          if (!this.predicate(value)) {
            return
          }

          translation.push(index)
          filteredList = filteredList.push(value)
        }
      })

      // update our cache
      cacheEntry = { srcList, filteredList, translation }
      this._cache.swap(srcList.root, cacheEntry)

      return filteredList
    }

    let filtered = []
    let translation = []

    for (let i = 0; i < srcList.size; ++i) {
      const value = srcList.get(i)

      if (this.predicate(value)) {
        filtered.push(value)
        translation.push(i)
      }
    }

    let filteredList = List(filtered, true)

    cacheEntry = { srcList, filteredList, translation }
    this._cache.swap(srcList.root, cacheEntry)

    return filteredList
  }
}
