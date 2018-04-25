import { makePatch } from '../util'

// i = size of the old array (also the index of the new value)
// x = the new values
// y = <null>

const pushManyPatch = makePatch({
  name: 'pushMany',
  apply: (backing, i, x, y) => backing.push.apply(backing, x),
  applyWrapper: (i, x, y, wrapper) => wrapper.pushMany(i, x),

  invertName: 'popMany',
  invert: (backing, i, x, y) => backing.length -= x.length,
  invertWrapper: (i, x, y, wrapper) => {
    for (let j = x.length - 1; j >= 0; --j) {
      wrapper.pop(i + j, x[j])
    }
  }
})

export default pushManyPatch
