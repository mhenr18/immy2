
export default class WeakCache {
  constructor () {
    this.cache = new WeakMap()
  }

  swap (key, newValue, nullValueHandler) {
    const oldValue = this.cache.get(key)
    if (newValue == null) {
      this.cache.delete(key)
    } else {
      this.cache.set(key, newValue)
    }

    if (oldValue == null && nullValueHandler != null) {
      return nullValueHandler()
    }

    return oldValue
  }
}
