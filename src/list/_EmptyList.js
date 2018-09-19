import _List from './_List'
import ListObserverWrapper from './ListObserverWrapper'
import { emptySetInstance } from '../set/_EmptySet'
import { emptyMapInstance } from '../map/_EmptyMap'

let emptyListInstance = null

class _EmptyList {
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

  last () {
    return undefined
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

  binaryFindInsertionIndex (target, comparator) {
    return 0
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

  isEmpty () {
    return true
  }

  toList () {
    return this
  }

  toArray () {
    return []
  }

  toJS () {
    return this.toArray()
  }

  toSet () {
    return emptySetInstance
  }

  find (predicate, thisVal, notSetValue) {
    return notSetValue
  }

  findIndex (predicate, thisVal) {
    return -1
  }

  // yields no values
  * [Symbol.iterator]() {}

  forEach (sideEffect) {
    return 0
  }

  map (mapper) {
    return this // if this is empty, then the mapped list would also be empty
  }

  pureMap (mapped) {
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

  sort (comparator) {
    return this // nothing to sort in an empty list
  }

  sortBy (comparatorValueMapper, comparator) {
    return this // nothing to sort in an empty list
  }

  flatMap (mapper, thisVal) {
    return this
  }

  groupBy (grouper, thisVal) {
    return emptyMapInstance
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
