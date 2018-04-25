import { makePatch } from '../util'

// i = the old size of the backing
// x = the new size of the backing
// y = <unused>

const growPatch = makePatch({
  name: 'grow',
  apply: (backing, i, x, y) => backing.length = x,
  applyWrapper: (i, x, y, wrapper) => {
    for (let j = i; j < x; ++j) {
      wrapper.push(j, undefined)
    }
  },

  invertName: 'shrink',
  invert: (backing, i, x, y) => backing.length = i,
  invertWrapper: (i, x, y, wrapper) => {
    for (let j = x - 1; j >= i; --j) {
      wrapper.pop(j, undefined)
    }
  }
})

export default growPatch
