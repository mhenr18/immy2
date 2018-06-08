import WeakCache from '../helper/WeakCache'
import ImmyList from '../list'

export default class ListTracer {
  constructor (name) {
    if (name == null) {
      name = 'ListTracer'
    }

    this.name = name
    this._cache = new WeakCache()
  }

  select (srcList) {
    let oldSrcList = this._cache.swap(srcList.root, null)
    if (oldSrcList == null) {
      console.log(`[${this.name}] (cache miss)`)
      oldSrcList = ImmyList()
    }


    oldSrcList.observeChangesFor(srcList, {
      insert: (i, v) => console.log(`[${this.name}] insert`, i, v),
      delete: (i, v) => console.log(`[${this.name}] delete`, i, v),
      set: (i, o, v) => console.log(`[${this.name}] set`, i, o, v)
    })
    
    this._cache.swap(srcList.root, oldSrcList)
    return srcList
  }
}
