// i = 0
// x = the values being shifted
// y = <null>

function shiftManyPatch (backing, i, x, y) {
  backing.splice(0, x.length)
}

function inverseShiftManyPatch (backing, i, x, y) {
  backing.unshift.apply(backing, x)
}

shiftManyPatch.inverse = inverseShiftManyPatch
inverseShiftManyPatch.inverse = shiftManyPatch

export default shiftManyPatch
