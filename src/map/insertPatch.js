import { makePatch } from '../util'

// i = key of the item being inserted
// x = the item being inserted
// y = <null>

const insertPatch = makePatch({
  name: 'insert',
  apply: (backing, i, x, y) => backing.set(i, x),
  applyWrapper: (i, x, y, wrapper) => wrapper.insert(i, x),

  invertName: 'delete',
  invert: (backing, i, x, y) => backing.delete(i),
  invertWrapper: (i, x, y, wrapper) => wrapper.delete(i)
})

export default insertPatch
