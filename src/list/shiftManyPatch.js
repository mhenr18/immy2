import { makePatch } from '../util'

// i = 0
// x = the values being shifted
// y = <null>

const shiftManyPatch = makePatch({
  name: 'shiftMany',
  apply: (backing, i, x, y) => backing.splice(0, x.length),
  applyWrapper: (i, x, y, wrapper) => {
    for (let j = 0; j < x.length; ++j) {
      wrapper.shift(x[j])
    }
  },

  invertName: 'unshiftMany',
  invert: (backing, i, x, y) => backing.unshift.apply(backing, x),
  invertWrapper: (i, x, y, wrapper) => {
    for (let j = x.length - 1; j >= 0; --j) {
      wrapper.unshift(x[j])
    }
  }
})

export default shiftManyPatch
