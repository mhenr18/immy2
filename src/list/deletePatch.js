// i = index of the item being deleted
// x = the item being deleted
// y = <null>

function deletePatch (backing, i, x, y) {
  backing.splice(i, 1)
}

function inverseDeletePatch (backing, i, x, y) {
  backing.splice(i, 0, x)
}

deletePatch.inverse = inverseDeletePatch
inverseDeletePatch.inverse = deletePatch

export default deletePatch
