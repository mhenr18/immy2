import { makePatch } from '../util'

// i = 0
// x = the value being shifted
// y = <null>

const shiftOnePatch = makePatch({
  name: 'shiftOne',
  apply: (backing, i, x, y) => backing.shift(),
  applyWrapper: (i, x, y, wrapper) => wrapper.shift(x),

  invertName: 'unshiftOne',
  invert: (backing, i, x, y) => backing.unshift(x),
  invertWrapper: (i, x, y, wrapper) => wrapper.unshift(x)
})

export default shiftOnePatch
