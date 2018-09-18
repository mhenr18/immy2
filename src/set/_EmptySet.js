import _Set from './_Set'
import SetObserverWrapper from './SetObserverWrapper'

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
    return new Set()
  }

  toJS () {
    return this.toSet()
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
