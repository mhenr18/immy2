
// subclasses must implement onExpand(), which *must* return a _List instance.
//
// if subclasses want methods to not return _List instances, they need to
// override those methods (which allows subclasses to implement their own
// optimizations)

export default class _ExpandoList {

  constructor (size) {
    this.size = size
    this.expanded = null
  }

  expand () {
    if (this.expanded == null) {
      this.expanded = this.onExpand()
    }

    return this.expanded
  }

  onExpand () {
    throw new Error('onExpand() must be implemented by subclass')
  }

  set (index, value) {
    return this.expand().set(index, value)
  }

  get (index) {
    return this.expand().get(index)
  }

  delete (index) {
    return this.expand().delete(index)
  }

  insert (index, value) {
    return this.expand().insert(index, value)
  }

  clear () {
    return this.expand().clear()
  }

  push (/* values */) {
    const expanded = this.expand()
    return expanded.push.apply(expanded, arguments)
  }

  pop () {
    return this.expand().pop()
  }

  unshift (/* values */) {
    const expanded = this.expand()
    return expanded.unshift.apply(expanded, arguments)
  }

  shift () {
    return this.expand().shift()
  }

  setSize (newSize) {
    return this.expand().setSize(newSize)
  }

  toArray () {
    return this.expand().toArray()
  }

  toJS () {
    return this.expand().toJS()
  }

  pureMap (mapper) {
    return this.expand().pureMap(mapper)
  }

  pureFilter (predicate) {
    return this.expand().pureFilter(predicate)
  }

  pureReduce (reducer, initialValue) {
    return this.expand().pureReduce(reducer, initialValue)
  }

  observeChangesFor (otherList, observer) {
    return this.expand().observeChangesFor(otherList, observer)
  }
}
