import { makePatch } from '../util'

// i = index of the item being set
// x = the old value
// y = the new value

const setOnePatch = makePatch({
  name: 'setOne (apply)',
  apply: (backing, i, x, y) => backing[i] = y,
  applyWrapper: (i, x, y, wrapper) => wrapper.set(i, x, y),

  invertName: 'setOne (invert)',
  invert: (backing, i, x, y) => backing[i] = x,
  invertWrapper: (i, x, y, wrapper) => wrapper.set(i, y, x)
})

export default setOnePatch
