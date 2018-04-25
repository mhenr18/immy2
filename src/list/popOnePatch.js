import { makePatch } from '../util'

// i = size of the new array (also the index of the value being popped)
// x = the value being popped
// y = <null>

const popOnePatch = makePatch({
  name: 'popOne',
  apply: (backing, i, x, y) => backing.pop(),
  applyWrapper: (i, x, y, wrapper) => wrapper.pop(i, x),

  invertName: 'pushOne',
  invert: (backing, i, x, y) => backing.push(x),
  invertWrapper: (i, x, y, wrapper) => wrapper.push(i, x)
})

export default popOnePatch
