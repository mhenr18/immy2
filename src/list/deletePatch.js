import { makePatch } from '../util'

// i = index of the item being deleted
// x = the item being deleted
// y = <null>

const deletePatch = makePatch({
  name: 'delete',
  apply: (backing, i, x, y) => backing.splice(i, 1),
  applyWrapper: (i, x, y, wrapper) => wrapper.delete(i, x),

  invertName: 'insert',
  invert: (backing, i, x, y) => backing.splice(i, 0, x),
  invertWrapper: (i, x, y, wrapper) => wrapper.insert(i, x)
})

export default deletePatch
