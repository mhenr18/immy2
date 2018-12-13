import WeakCache from '../helper/WeakCache'
import List, { isList } from '../list'

// your mapping function can return any iterable.

export default class FlatMapSelector {
  constructor (mapper) {
    this.mapper = mapper
    this._cache = new WeakCache()
  }

  select (srcList) {
    if (srcList.size === 0) {
      return List()
    }

    let { prevList, flatMappedList, offsets, mappedValues } = this._cache.swap(srcList.root, null, () => ({
      prevList: List(),
      flatMappedList: List(),
      offsets: [],
      mappedValues: []
    }))

    const insertMapped = (index, mapped) => {
      let offset = 0
      if (index >= offsets.length) {
        offset = flatMappedList.size
      } else {
        offset = offsets[index]
      }

      let i = 0
      for (let mappedValue of mapped) {
        flatMappedList = flatMappedList.insert(offset + i, mappedValue)
        ++i
      }

      // bump all of the offsets and add our new one
      for (let j = index; j < offsets.length; ++j) {
        offsets[j] += i
      }

      offsets.splice(index, 0, offset)
      mappedValues.splice(index, 0, mapped)
    }

    const deleteAtIndex = (index) => {
      let offset = offsets[index]
      let nextOffset = 0
      if (index + 1 >= offsets.length) {
        nextOffset = flatMappedList.size
      } else {
        nextOffset = offsets[index + 1]
      }

      let mappedSize = nextOffset - offset
      for (let i = nextOffset - 1; i >= offset; --i) {
        flatMappedList = flatMappedList.delete(i)
      }

      // reduce all of our offsets, and then remove the old one
      for (let j = index; j < offsets.length; ++j) {
        offsets[j] -= mappedSize
      }

      offsets.splice(index, 1)
      mappedValues.splice(index, 1)
    }

    const setValue = (index, oldValue, newValue) => {
      const oldMapped = mappedValues[index]
      const newMapped = this.mapper(newValue)

      if (!isList(oldMapped) || !isList(newMapped)) {
        deleteAtIndex(index)
        insertMapped(index, newMapped)
        return
      }

      // we can support diffs if the mapped values are immy lists
      const offset = offsets[index]

      oldMapped.observeChangesFor(newMapped, {
        insert: (i, n) => {
          flatMappedList = flatMappedList.insert(offset + i, n)
        },
        delete: (i, o) => {
          flatMappedList = flatMappedList.delete(offset + i)
        },
        set: (i, o, n) => {
          flatMappedList = flatMappedList.set(offset + i, n)
        }
      })

      // update existing offsets
      const delta = newValue.size - oldValue.size
      for (let j = index + 1; j < offsets.length; ++j) {
        offsets[j] += delta
      }

      mappedValues[index] = newMapped
    }

    prevList.observeChangesFor(srcList, {
      insert: (index, newValue) => insertMapped(index, this.mapper(newValue)),
      delete: (index, oldValue) => deleteAtIndex(index),
      set: setValue
    })

    this._cache.swap(srcList.root, { prevList: srcList, flatMappedList, offsets, mappedValues })
    return flatMappedList
  }
}
