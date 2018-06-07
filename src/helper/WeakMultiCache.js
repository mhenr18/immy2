
// weak cache, but supporting ordered keys by using a tree of weakmaps

export default class WeakMultiCache {
  constructor () {
    this._root = new WeakMap()
  }

  swap (keys, newValue, nullValueHandler) {
    if (keys.length === 0) {
      throw new Error('must have at least one key')
    }

    return this.__swap(this._root, 0, keys, newValue, nullValueHandler)
  }

  __swap (weakMap, i, keys, newValue, nullValueHandler) {
    const key = keys[i]

    if (i === keys.length - 1) {
      // leaf
      const oldValue = weakMap.get(key)
      if (newValue == null) {
        weakMap.delete(key)
      } else {
        weakMap.set(key, newValue)
      }

      if (oldValue == null && nullValueHandler != null) {
        return nullValueHandler()
      }

      return oldValue
    } else {
      // node
      let existingMap = weakMap.get(key)
      if (existingMap == null) {
        existingMap = new WeakMap()
        weakMap.set(key, existingMap)
      }

      return this.__swap(existingMap, i + 1, keys, newValue, nullValueHandler)
    }
  }
}
