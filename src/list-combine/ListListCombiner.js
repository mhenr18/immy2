import List from '../list'
import _WeakLruCache from '../helper/_WeakLruCache'

export default class ListListCombiner {
  constructor (getSecondaryKey, combiner) {
    this.getSecondaryKey = getSecondaryKey
    this.combiner = combiner

    this._cache = new _WeakLruCache(2)
  }

  combine (primaryList, secondaryList) {
    let secondaries = new Set()
    const lookup = (secondaryKey) => {
      const secondaryValue = secondaryList.find(s => this.getSecondaryKey(s) === secondaryKey)
      secondaries.add(secondaryKey)

      return secondaryValue
    }


    let cacheEntry = this._cache.swap(primaryList.root, null)
    if (cacheEntry != null) {
      if (cacheEntry.secondaryRoot === secondaryList.root) {
        const prevPrimaryList = cacheEntry.primaryList
        const prevSecondaryList = cacheEntry.secondaryList
        let combined = cacheEntry.combined
        let primaryToSecondaries = cacheEntry.primaryToSecondaries
        let secondaryToPrimaries = cacheEntry.secondaryToPrimaries
        cacheEntry = null

        const select = (primaryValue) => {
          const combinedValue = this.combiner(primaryValue, lookup)

          // update our mappings
          primaryToSecondaries.set(primaryValue, secondaries)
          for (let secondaryKey of secondaries) {
            if (secondaryToPrimaries.has(secondaryKey)) {
              secondaryToPrimaries.get(secondaryKey).add(primaryValue)
            } else {
              secondaryToPrimaries.set(secondaryKey, new Set([primaryValue]))
            }
          }

          secondaries = new Set()
          return combinedValue
        }

        let invalidPrimaries = null

        if (prevSecondaryList !== secondaryList) {
          invalidPrimaries = new Set()

          prevSecondaryList.observeChangesFor(secondaryList, {
            insert: (index, value) => {
              const secondaryKey = this.getSecondaryKey(value)
              const primaries = secondaryToPrimaries.get(secondaryKey)
              if (primaries) {
                for (let primary of primaries) {
                  primaryToSecondaries.delete(primary)
                  invalidPrimaries.add(primary)
                }
              }

              secondaryToPrimaries.delete(secondaryKey)
            },

            delete: (index, value) => {
              const secondaryKey = this.getSecondaryKey(value)
              const primaries = secondaryToPrimaries.get(secondaryKey)
              if (primaries) {
                for (let primary of primaries) {
                  primaryToSecondaries.delete(primary)
                  invalidPrimaries.add(primary)
                }
              }

              secondaryToPrimaries.delete(secondaryKey)
            }
          })
        }

        if (prevPrimaryList !== primaryList) {
          prevPrimaryList.observeChangesFor(primaryList, {
            insert: (index, value) => {
              combined = combined.insert(index, select(value))
            },

            delete: (index, value) => {
              const secondaryKeys = primaryToSecondaries.get(value)
              if (secondaryKeys) {
                for (let secondaryKey of secondaryKeys) {
                  secondaryToPrimaries.get(secondaryKey).delete(value)
                }
              }

              primaryToSecondaries.delete(value)
              combined = combined.delete(index)
            },

            set: (index, oldValue, newValue) => {
              const secondaryKeys = primaryToSecondaries.get(oldValue)
              if (secondaryKeys) {
                for (let secondaryKey of secondaryKeys) {
                  secondaryToPrimaries.get(secondaryKey).delete(oldValue)
                }
              }

              primaryToSecondaries.delete(oldValue)
              combined = combined.set(index, select(newValue))
            }
          })
        }

        if (invalidPrimaries != null && invalidPrimaries.size > 0) {
          // the combined values are invalid due to changes in the secondaries - recombine
          // any affected values
          for (let i = 0; i < primaryList.size; ++i) {
            const primary = primaryList.get(i)

            if (invalidPrimaries.has(primary)) {
              combined = combined.set(i, select(primary))
            }
          }
        }

        cacheEntry = {
          secondaryRoot: secondaryList.root,
          primaryList,
          secondaryList,
          combined,
          primaryToSecondaries,
          secondaryToPrimaries
        }
        this._cache.swap(primaryList.root, cacheEntry)
    
        return combined
      }
    }

    cacheEntry = null

    let combined = List()
    let primaryToSecondaries = new Map()
    let secondaryToPrimaries = new Map()

    for (let i = 0; i < primaryList.size; ++i) {
      const primaryValue = primaryList.get(i)
      const combinedValue = this.combiner(primaryValue, lookup)

      // update our mappings
      primaryToSecondaries.set(primaryValue, secondaries)
      for (let secondaryKey of secondaries) {
        if (secondaryToPrimaries.has(secondaryKey)) {
          secondaryToPrimaries.get(secondaryKey).add(primaryValue)
        } else {
          secondaryToPrimaries.set(secondaryKey, new Set([primaryValue]))
        }
      }

      secondaries = new Set()
      combined = combined.push(combinedValue)
    }

    cacheEntry = {
      secondaryRoot: secondaryList.root,
      primaryList,
      secondaryList,
      combined,
      primaryToSecondaries,
      secondaryToPrimaries
    }
    this._cache.swap(primaryList.root, cacheEntry)

    return combined
  }
}
