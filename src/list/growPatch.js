// i = the old size of the backing
// x = the new size of the backing
// y = <unused>

function growPatch (backing, i, x, y) {
  backing.length = x
}

function inverseGrowPatch (backing, i, x, y) {
  backing.length = i
}

growPatch.inverse = inverseGrowPatch
inverseGrowPatch.inverse = growPatch

export default growPatch
