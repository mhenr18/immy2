import WeakCache from '../helper/WeakCache'
import ImmyMap from '../map'
import ImmyList from '../list'

export default class GroupBySelector {
  constructor (grouper) {
    this.grouper = grouper
    this._cache = new WeakCache()
  }

  select (srcList) {
    let { oldSrcList, oldGrouped } = this._cache.swap(srcList.root, null, () => ({
      oldSrcList: ImmyList(),
      oldGrouped: ImmyMap()
    }))

    oldSrcList.observeChangesFor(srcList, {
      insert: (i, x) => {
        const groupKey = this.grouper(x)

        if (oldGrouped.has(groupKey)) {
          oldGrouped = oldGrouped.set(groupKey, oldGrouped.get(groupKey).push(x))
        } else {
          oldGrouped = oldGrouped.set(groupKey, ImmyList([ x ]))
        }
      },
      delete: (i, x) => {
        const groupKey = this.grouper(x)

        let group = oldGrouped.get(groupKey)
        if (group == null) {
          throw new Error('expected to find a group')
        }

        let index = group.indexOf(x)
        group = group.delete(index)

        if (group.size === 0) {
          oldGrouped = oldGrouped.delete(groupKey)
        } else {
          oldGrouped = oldGrouped.set(groupKey, group)
        }
      }
    })

    this._cache.swap(srcList.root, { oldSrcList: srcList, oldGrouped })
    return oldGrouped
  }
}
