const { invert } = require('./invert')

// i = the new size of the backing
// x = the old size of the backing
// y = <unused>

function growPatch (backing, source, target) {
  backing.length = target.i
  invert(source, target)
}

function inverseGrowPatch (backing, source, target) {
  backing.length = target.x
  invert(source, target)
}

growPatch.inverse = inverseGrowPatch
inverseGrowPatch.inverse = growPatch

module.exports = growPatch
