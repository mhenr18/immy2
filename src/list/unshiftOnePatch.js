// i = 0
// x = the new value
// y = <null>

function unshiftOnePatch (backing, i, x, y) {
  backing.unshift(x)
}

function inverseUnshiftOnePatch (backing, i, x, y) {
  backing.shift()
}

unshiftOnePatch.inverse = inverseUnshiftOnePatch
inverseUnshiftOnePatch.inverse = unshiftOnePatch

export default unshiftOnePatch
