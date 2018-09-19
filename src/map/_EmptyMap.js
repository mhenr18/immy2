import _Map from './_Map'
import MapObserverWrapper from './MapObserverWrapper'
import { emptyListInstance } from '../list/_EmptyList'
import { emptySetInstance } from '../set/_EmptySet'

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

  map (mapper, thisVal) {
    return this
  }

  forEach (sideEffect, thisVal) {
    return 0
  }

  filter (predicate, thisVal) {
    return this
  }

  toList () {
    return emptyListInstance
  }

  toSet () {
    return emptySetInstance
  }

  toArray () {
    return []
  }

  toMap () {
    return this
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
