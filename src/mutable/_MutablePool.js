import _MutableStack from "./_MutableStack";

// a pool is a collection of objects, which can be created on-demand using a factory.
// objects can be removed from the pool (and created on-demand as needed),
// and added back into it.

export default class _MutablePool {
  constructor (factory, initialSize) {
    this._factory = factory
    this._stack = new _MutableStack()
  }
  
  clear () {
    this._stack.clear()
  }

  remove () {
    if (this._stack.size === 0) {
      return this._factory()
    } else {
      return this._stack.pop()
    }
  }

  add (item) {
    this._stack.push(item)
  }
}
