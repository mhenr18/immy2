import { makePatch } from '../util'

// i = key of the item being inserted
// x = the item being inserted
// y = <null>

const deletePatch = makePatch({
  name: 'delete',
  apply: (backing, i, x, y) => backing.delete(i),
  applyWrapper: (i, x, y, wrapper) => wrapper.delete(i, x),

  invertName: 'insert',
  invert: (backing, i, x, y) => backing.set(i, x),
  invertWrapper: (i, x, y, wrapper) => wrapper.insert(i, x)
})

export default deletePatch
