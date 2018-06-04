import { makePatch } from '../util'

// i = key of the item
// x = old value
// y = new value

const updatePatch = makePatch({
  name: 'update',
  apply: (backing, i, x, y) => backing.set(i, y),
  applyWrapper: (i, x, y, wrapper) => wrapper.set(i, x, y),

  invertName: 'update (inverse)',
  invert: (backing, i, x, y) => backing.set(i, x),
  invertWrapper: (i, x, y, wrapper) => wrapper.set(i, y, x)
})

export default updatePatch
