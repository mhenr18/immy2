import { makePatch } from '../util'

// i = 0
// x = the new value
// y = <null>

const unshiftOnePatch = makePatch({
  name: 'shiftOne',
  apply: (backing, i, x, y) => backing.unshift(x),
  applyWrapper: (i, x, y, wrapper) => wrapper.unshift(x),

  invertName: 'unshiftOne',
  invert: (backing, i, x, y) => backing.shift(),
  invertWrapper: (i, x, y, wrapper) => wrapper.shift(x)
})

export default unshiftOnePatch
