import { makePatch } from '../util'

// i = -1 (not used)
// x = indexes of the items being deleted (in ascending order)
// y = the items being deleted (x[i] is the index, y[i] is the item)

const deleteManySparsePatch = makePatch({
  name: 'delete many sparse',
  apply: (backing, i, x, y) => {
    if (x.length === 0) {
      return
    }

    let dest = x[0]
    let src = dest
    let offset = 0

    while (src < backing.length) {
      while (src === x[offset] && src < backing.length) {
        ++src
        ++offset
      }

      if (src < backing.length) {
        backing[dest++] = backing[src++]
      }
    }

    backing.length -= x.length
  },
  applyWrapper: (i, x, y, wrapper) => {
    // go in reverse because this keeps the indexes correct
    for (let i = x.length - 1; i >= 0; --i) {
      wrapper.delete(x[i], y[i])
    }
  },

  invertName: 'insert many sparse',
  invert: (backing, i, x, y) => {
    if (x.length === 0) {
      return
    }

    backing.length += x.length

    let dest = backing.length - 1
    let src = dest - x.length
    let offset = x.length - 1

    while (dest >= x[0]) {
      while (dest === x[offset] && dest >= 0) {
        backing[dest] = y[offset]
        --offset
        --dest
      }

      if (dest >= 0) {
        backing[dest--] = backing[src--]
      }
    }
  },
  invertWrapper: (i, x, y, wrapper) => {
    // go forwards as this keeps the indexes correct
    for (let i = 0; i < x.length; ++i) {
      wrapper.insert(x[i], y[i])
    }
  }
})

export default deleteManySparsePatch
