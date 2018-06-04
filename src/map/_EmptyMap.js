import _Map from './_Map'
import MapObserverWrapper from './MapObserverWrapper'

let emptyMapInstance = null

class _EmptyMap {
  constructor () {
    this.size = 0
    this.root = {}
  }

  clear () {
    return this
  }

  set (key, value) {
    return new _Map(new Map()).set(key, value)
  }

  get (key) {
    return undefined
  }

  has (key) {
    return false
  }

  delete (key) {
    return this
  }

  toArray () {
    return []
  }

  toMap () {
    return new Map()
  }

  toJS () {
    return this.toMap()
  }

  // yields no values
  * [Symbol.iterator] () {}

  observeChangesFor (otherMap, observer) {
    if (otherMap === this) {
      return
    }

    const wrapper = new MapObserverWrapper(observer)
    wrapper.insertMany(otherMap._getBacking())
  }

  toString () {
    return 'ImmyMap {}'
  }

  inspect () {
    return this.toString()
  }
}

emptyMapInstance = new _EmptyMap()
export { emptyMapInstance }
