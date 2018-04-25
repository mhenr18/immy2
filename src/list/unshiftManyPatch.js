import { makePatch } from '../util'

// i = 0
// x = the new values
// y = <null>

const unshiftManyPatch = makePatch({
  name: 'unshiftMany',
  apply: (backing, i, x, y) => backing.unshift.apply(backing, x),
  applyWrapper: (i, x, y, wrapper) => {
    for (let j = x.length - 1; j >= 0; --j) {
      wrapper.unshift(x[j])
    }
  },

  invertName: 'shiftMany',
  invert: (backing, i, x, y) => backing.splice(0, x.length),
  invertWrapper: (i, x, y, wrapper) => {
    for (let j = 0; j < x.length; ++j) {
      wrapper.shift(x[j])
    }
  }
})

export default unshiftManyPatch
