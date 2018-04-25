import { makePatch } from '../util'

// i = index of the first item being set
// x = the old values
// y = the new values

const setManyPatch = makePatch({
  name: 'setMany (apply)',
  apply: (backing, i, x, y) => {
    for (let j = 0; j < y.length; ++j) {
      backing[i + j] = y[j]
    }
  },
  applyWrapper: (i, x, y, wrapper) => {
    for (let j = 0; j < y.length; ++j) {
      wrapper.set(i + j, x[j], y[j])
    }
  },

  invertName: 'setMany (invert)',
  invert: (backing, i, x, y) => {
    for (let j = 0; j < x.length; ++j) {
      backing[i + j] = x[j]
    } 
  },
  invertWrapper: (i, x, y, wrapper) => {
    for (let j = 0; j < x.length; ++j) {
      wrapper.set(i + j, y[j], x[j])
    } 
  }
})

export default setManyPatch
