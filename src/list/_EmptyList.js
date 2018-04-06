import _ExpandoList from './_ExpandoList'

let emptyListInstance = null

class _EmptyList extends _ExpandoList {
  constructor () {
    super(0)
  }

  onExpand () {
    return new _List([])
  }

  get (index) {
    return undefined
  }

  delete (index) {
    return this
  }

  clear () {
    return this
  }

  pop () {
    return this
  }

  shift () {
    return this
  }

  setSize (newSize) {
    if (newSize === 0) {
      return this
    } else {
      return super.setSize(newSize)
    }
  }

  pureMap (mapper) {
    return this // if this is empty, then the mapped list would also be empty
  }

  pureFilter (predicate) {
    return this // nothing to filter out of an empty list
  }

  pureReduce (reducer, initialValue) {
    return initialValue
  }

  observeChangesFor (otherList, observer) {
    
  }
}

emptyListInstance = new _EmptyList()
export { emptyListInstance }
