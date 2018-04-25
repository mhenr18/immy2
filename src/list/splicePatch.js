import { makePatch } from '../util'

// i = index of the splice
// x = arguments to make the splice
// y = arguments to invert the splice

const splicePatch = makePatch({
  name: 'splice (apply)',
  apply: (backing, i, x, y) => backing.splice.apply(backing, x),
  applyWrapper: (i, x, y, wrapper) => {
    for (let j = 2; j < y.length; ++j) {
      wrapper.delete(i, y[j])
    }

    for (let j = 2; j < x.length; ++j) {
      wrapper.insert(i + (j - 2), x[j])
    }
  },

  invertName: 'splice (invert)',
  invert: (backing, i, x, y) => backing.splice.apply(backing, y),
  invertWrapper: (i, x, y, wrapper) => {
    for (let j = 2; j < x.length; ++j) {
      wrapper.delete(i, x[j])
    }

    for (let j = 2; j < y.length; ++j) {
      wrapper.insert(i + (j - 2), y[j])
    }
  }
})

export default splicePatch
