import _Set from './_Set'
import SetObserverWrapper from './SetObserverWrapper'
import { emptyListInstance } from '../list/_EmptyList'

let emptySetInstance = null

class _EmptySet {
  constructor () {
    this.size = 0
    this.root = {}
  }

  count () {
    return 0
  }

  first () {
    return undefined
  }

  add (value) {
    return new _Set(new Set()).add(value)
  }

  clear () {
    return this
  }

  delete (key) {
    return this
  }

  has (key) {
    return false
  }

  toArray () {
    return []
  }

  toSet () {
    return this
  }

  toList () {
    return emptyListInstance
  }

  toJS () {
    return new Set()
  }

  forEach (sideEffect) {
    return 0
  }

  // yields no values
  * [Symbol.iterator] () {}

  observeChangesFor (otherSet, observer) {
    if (otherSet === this) {
      return
    }

    const wrapper = new SetObserverWrapper(observer)
    wrapper.insertMany(otherSet._getBacking())
  }

  toString () {
    return 'ImmySet {}'
  }

  inspect () {
    return this.toString()
  }
}

emptySetInstance = new _EmptySet()
export { emptySetInstance }
