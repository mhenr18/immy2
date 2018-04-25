
// a memory-efficient mutable stack that retains a single array.

export default class _MutableStack {
  constructor () {
    this._buffer = new Array(8)
    this.size = 0
  }

  clear () {
    for (let i = 0; i < this.size; ++i) {
      this._buffer[i] = undefined
    }

    this.size = 0
  }

  push (value) {
    if (this.size === this._buffer.length) {
      this._buffer.length *= 2
    }

    this._buffer[this.size] = value
    ++this.size
  }

  pop () {
    if (this.size === 0) {
      return undefined
    }

    --this.size
    return this._buffer[this.size]
  }
}
