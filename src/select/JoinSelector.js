import WeakMultiCache from '../helper/WeakMultiCache'
import ImmyMap from '../map'
import ImmyList from '../list'
import WeakCache from '../helper/WeakCache'

export default class JoinSelector {
  constructor (secondarySelector, joiner) {
    this.secondarySelector = secondarySelector
    this.joiner = joiner
    this.needsOriginalInput = true
    this._cache = new WeakMultiCache()
    this._resolveManyCache = new WeakCache()
  }

  select (srcMap, originalInput) {
    const secondaryMap = this.secondarySelector(originalInput)
    if (srcMap.size === 0) {
      return ImmyMap()
    }

    let {
      oldSrcMap,
      oldSecondaryMap,
      oldJoinedMap,
      secondariesByPrimary,
      primaryBySecondary
    } = this._cache.swap([srcMap.root, secondaryMap.root], null, () => ({
      oldSrcMap: ImmyMap(),
      oldSecondaryMap: ImmyMap(),
      oldJoinedMap: ImmyMap(),
      secondariesByPrimary: new Map(),
      primaryBySecondary: new Map()
    }))

    // invalidate primaries if any of the resolved secondaries have changed
    let primariesNeedingSelection = new Set()

    let invalidateBySecondaryKey = (secondaryKey) => {
      let primary = primaryBySecondary.get(secondaryKey)
      if (primary == null) {
        return
      }

      // this secondary was in use, we need to reselect
      for (let secondary of secondariesByPrimary.get(primary)) {
        primaryBySecondary.delete(secondary)
      }
      secondariesByPrimary.delete(primary)

      primariesNeedingSelection.add(primary)
    }

    oldSecondaryMap.observeChangesFor(secondaryMap, {
      insert: invalidateBySecondaryKey, // inserts matter as things that may have resolved to undefined might no longer be undefined
      delete: invalidateBySecondaryKey
    })

    // invalidate changed primaries
    oldSrcMap.observeChangesFor(srcMap, {
      insert: (key, value) => {
        primariesNeedingSelection.add(key)

        // if we're inserting a new primary, we won't know about any of its secondaries
        // so we don't need to clean anything up
      },
      delete: (key, value) => {
        primariesNeedingSelection.delete(key)

        // if we're deleting a primary, we need to clean up our secondary mapping
        for (let secondary of secondariesByPrimary.get(primary)) {
          primaryBySecondary.delete(secondary)
        }
        secondariesByPrimary.delete(primary)
      }
    })

    // now select all invalid primaries
    for (let primaryKey of primariesNeedingSelection) {
      let resolvedSecondaryKeys = new Set()

      let resolveOne = (secondaryKey) => {
        if (secondaryKey == null) {
          return null
        }

        resolvedSecondaryKeys.add(secondaryKey)
        return secondaryMap.get(secondaryKey)
      }

      let resolveMany = (secondaryKeys) => {
        if (secondaryKeys == null || secondaryKeys.size === 0) {
          return ImmyList()
        }

        let { oldSecondaryKeys, oldSecondaryValues } = this._resolveManyCache.swap(secondaryKeys.root, null, () => ({
          oldSecondaryKeys: ImmyList(),
          oldSecondaryValues: ImmyList()
        }))

        oldSecondaryKeys.observeChangesFor(secondaryKeys, {
          insert: (i, k) => {
            oldSecondaryValues = oldSecondaryValues.insert(i, resolveOne(k))
          },
          delete: (i, k) => {
            oldSecondaryValues = oldSecondaryValues.delete(i)
          },
          set: (i, o, k) => {
            oldSecondaryValues = oldSecondaryValues.set(i, resolveOne(k))
          }
        })

        // diffing helps us ensure that the values and keys lists have the same elements in
        // the same order, but does nothing for the currency of the oldSecondaryValues list,
        // which needs to have every value be re-resolved
        for (let i = 0; i < secondaryKeys.size; ++i) {
          // if the resolved value hasn't changed, oldSecondaryValues won't be updated
          oldSecondaryValues = oldSecondaryValues.set(i, resolveOne(secondaryKeys.get(i)))
        }

        this._resolveManyCache.swap(secondaryKeys.root, { oldSecondaryKeys: secondaryKeys, oldSecondaryValues })
        return oldSecondaryValues
      }

      let joined = this.joiner(primaryKey, srcMap.get(primaryKey), resolveOne, resolveMany)
      oldJoinedMap = oldJoinedMap.set(primaryKey, joined)

      for (let secondaryKey of resolvedSecondaryKeys) {
        primaryBySecondary.set(secondaryKey, primaryKey)
      }
      secondariesByPrimary.set(primaryKey, resolvedSecondaryKeys)
    }

    this._cache.swap([srcMap.root, secondaryMap.root], {
      oldSrcMap: srcMap,
      oldSecondaryMap: secondaryMap,
      oldJoinedMap,
      secondariesByPrimary,
      primaryBySecondary
    })

    return oldJoinedMap
  }
}
