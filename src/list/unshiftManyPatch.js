// i = 0
// x = the new values
// y = <null>

function unshiftManyPatch (backing, i, x, y) {
  backing.unshift.apply(backing, x)
}

function inverseUnshiftManyPatch (backing, i, x, y) {
  backing.splice(0, x.length)
}

unshiftManyPatch.inverse = inverseUnshiftManyPatch
inverseUnshiftManyPatch.inverse = unshiftManyPatch

export default unshiftManyPatch
