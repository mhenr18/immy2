import { makePatch } from '../util'

// i = size of the new array (also the index of the first value being popped)
// x = the values being popped
// y = <null>

const popManyPatch = makePatch({
  name: 'popMany',
  apply: (backing, i, x, y) => backing.length -= x.length,
  applyWrapper: (i, x, y, wrapper) => {
    for (let j = x.length - 1; j >= 0; --j) {
      wrapper.pop(i + j, x[j])
    }
  },

  invertName: 'pushMany',
  invert: (backing, i, x, y) => backing.push.apply(backing, x),
  invertWrapper: (i, x, y, wrapper) => wrapper.pushMany(i, x)
})

export default popManyPatch
