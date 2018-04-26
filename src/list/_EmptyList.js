import _List from './_List'
import ListObserverWrapper from './ListObserverWrapper'

let emptyListInstance = null

class _EmptyList {
  constructor () {
    this.size = 0
    this.root = {}
  }

  set (index, value) {
    return new _List([]).set(index, value)
  }

  get (index) {
    return undefined
  }

  delete (index) {
    return this
  }

  insert (index, value) {
    return new _List([]).insert(index, value)
  }

  insertSorted (value, keySelector) {
    return new _List([]).insertSorted(value, keySelector)
  }

  indexOfSorted (value, keySelector) {
    return -1
  }

  binaryFindByKey (targetKey, keySelector, notSetValue) {
    return notSetValue
  }

  binaryFindIndexByKey (targetKey, keySelector) {
    return -1
  }

  binaryFindInsertionIndexByKey (targetKey, keySelector) {
    return 0
  }

  clear () {
    return this
  }

  push (/* values */) {
    const list = new _List([])
    return list.push.apply(list, arguments)
  }

  pop () {
    return this
  }

  popMany () {
    return this
  }

  unshift (/* values */) {
    const list = new _List([])
    return list.unshift.apply(list, arguments)
  }

  shift () {
    return this
  }

  shiftMany () {
    return this
  }

  setSize (newSize) {
    if (newSize === 0) {
      return this
    } else {
      return new _List(new Array(newSize))
    }
  }

  splice (/* arguments */) {
    const list = new _List([])
    return list.splice.apply(list, arguments)
  }

  toArray () {
    return []
  }

  toJS () {
    return this.toArray()
  }

  find (predicate, thisVal, notSetValue) {
    return notSetValue
  }

  findIndex (predicate, thisVal) {
    return -1
  }

  forEach (sideEffect) {
    return 0
  }

  map (mapper) {
    return this // if this is empty, then the mapped list would also be empty
  }

  mapInPlace (mapper) {
    return this // if this is empty, then the mapped list would also be empty
  }

  filter (predicate) {
    return this // nothing to filter out of an empty list
  }

  filterInPlace (predicate) {
    return this // nothing to filter out of an empty list
  }

  reduce (reducer, initialValue) {
    return initialValue
  }

  observeChangesFor (otherList, observer) {
    if (otherList === this) {
      return
    }

    const wrapper = new ListObserverWrapper(observer)
    wrapper.pushMany(0, otherList._getBacking().slice())
  }

  toString () {
    return `ImmyList(0) []`
  }

  inspect () {
    return this.toString()
  }
}

emptyListInstance = new _EmptyList()
export { emptyListInstance }
