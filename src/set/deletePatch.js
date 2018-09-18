import { makePatch } from '../util'

// i = key of the item being inserted

const deletePatch = makePatch({
  name: 'delete',
  apply: (backing, i) => backing.delete(i),
  applyWrapper: (i, wrapper) => wrapper.delete(i),

  invertName: 'insert',
  invert: (backing, i) => backing.set(i),
  invertWrapper: (i, wrapper) => wrapper.insert(i)
})

export default deletePatch
