import { makePatch } from '../util'

// i = index of the item being inserted
// x = the item being inserted
// y = <null>

const insertPatch = makePatch({
  name: 'insert',
  apply: (backing, i, x, y) => backing.splice(i, 0, x),
  applyWrapper: (i, x, y, wrapper) => wrapper.insert(i, x),

  name: 'delete',
  invert: (backing, i, x, y) => backing.splice(i, 1),
  invertWrapper: (i, x, y, wrapper) => wrapper.delete(i, x)
})

export default insertPatch
