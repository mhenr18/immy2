import { makePatch } from '../util'

// i = key of the item being inserted

const insertPatch = makePatch({
  name: 'insert',
  apply: (backing, i) => backing.add(i),
  applyWrapper: (i, wrapper) => wrapper.insert(i),

  invertName: 'delete',
  invert: (backing, i) => backing.delete(i),
  invertWrapper: (i, wrapper) => wrapper.delete(i)
})

export default insertPatch
