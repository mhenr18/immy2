import _WeakLruCache from '../helper/_WeakLruCache'
import List from '../list'

const emptyListInstance = List()

export default class MapSelector {

  constructor (mapper) {
    // this.mapper is public API for the optimizer
    this.mapper = mapper

    this._cache = new _WeakLruCache(2)
  }

  select (srcList) {
    if (srcList === emptyListInstance) {
      return emptyListInstance
    }

    let cacheEntry = this._cache.swap(srcList.root, null)
    if (cacheEntry != null) {
      let oldSrcList = cacheEntry.srcList
      let mappedList = cacheEntry.mappedList
      cacheEntry = null

      oldSrcList.observeChangesFor(srcList, {
        insert: (i, x) => (mappedList = mappedList.insert(i, this.mapper(x))),
        delete: (i, x) => (mappedList = mappedList.delete(i)),
        set: (i, x) => (mappedList = mappedList.set(i, this.mapper(x)))
      })

      // update our cache
      cacheEntry = { srcList, mappedList }
      this._cache.swap(srcList.root, cacheEntry)

      return mappedList
    }

    // when using new Array(n) to construct an array of length n, V8 allocates
    // exactly n elements, meaning that the next push operation triggers a
    // reallocation and requires copying every element.
    //
    // while this is expected (pushing is *amortized* O(1), not guaranteed O(1))
    // it creates a poor user experience for someone doing benchmarks seeing
    // essentially identical performance timings for the initial map and the
    // subsequent re-map with only a small change.
    //
    // we make a trade-off here and coerce the Array into internally over-allocating
    // by allocating (n - 1) elements, and then pushing the final element on. this
    // triggers that re-allocation within the initial map, so that subsequent re-maps
    // are extremely fast.
    //
    // this trade-off is acceptable due to how much faster the initial map is when
    // compared to the alternative libraries.

    let mapped = new Array(srcList.size - 1)
    for (let i = 0; i < srcList.size - 1; ++i) {
      mapped[i] = this.mapper(srcList.get(i))
    }
    mapped.push(this.mapper(srcList.get(srcList.size - 1)))

    let mappedList = List(mapped, true)
    cacheEntry = { srcList, mappedList }
    this._cache.swap(srcList.root, cacheEntry)

    return mappedList
  }

}
