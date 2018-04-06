// i = 0
// x = the value being shifted
// y = <null>

function shiftOnePatch (backing, i, x, y) {
  backing.shift()
}

function inverseShiftOnePatch (backing, i, x, y) {
  backing.unshift(x)
}

shiftOnePatch.inverse = inverseShiftOnePatch
inverseShiftOnePatch.inverse = shiftOnePatch

export default shiftOnePatch
