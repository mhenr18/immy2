// i = index of the item being inserted
// x = the item being inserted
// y = <null>

function insertPatch (backing, i, x, y) {
  backing.splice(i, 0, x)
}

function inverseInsertPatch (backing, i, x, y) {
  backing.splice(i, 1)
}

insertPatch.inverse = inverseInsertPatch
inverseInsertPatch.inverse = insertPatch

export default insertPatch
