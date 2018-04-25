import { makePatch } from '../util'

// i = size of the old array (also the index of the new value)
// x = the new value
// y = <null>

const pushOnePatch = makePatch({
  name: 'pushOne',
  apply: (backing, i, x, y) => backing.push(x),
  applyWrapper: (i, x, y, wrapper) => wrapper.push(i, x),

  invertName: 'popOne',
  invert: (backing, i, x, y) => backing.pop(),
  invertWrapper: (i, x, y, wrapper) => wrapper.pop(i, x)
})

export default pushOnePatch
