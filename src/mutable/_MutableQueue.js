
export default class _MutableQueue {
  constructor () {
    this._buffer = new Array(8)
    this._begin = 0
    this._end = 0
    this.size = 0
  }

  clear () {
    for (let i = this._begin; i < this._end; ++i) {
      this._buffer[i] = undefined
    }

    this._begin = 0
    this._end = 0
    this.size = 0
  }

  push (value) {
    ++this.size
    this._buffer[this._end++] = value
  }

  shift () {
    if (this.size === 0) {
      return undefined
    }

    const value = this._buffer[this._begin]
    this._buffer[this._begin++] = undefined // we don't want to keep any references
    --this.size

    // when we empty the queue, reset our begin and end pointers
    // so that we aren't wasting space
    if (this.size === 0) {
      this._begin = 0
      this._end = 0
    }

    return value
  }
}
