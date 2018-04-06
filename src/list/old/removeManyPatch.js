const { invert } = require('./invert')

// i = the index to remove from
// x = the number of items being removed
// y = the arguments array used to call splice() to add the items back in

function removeManyPatch (backing, source, target) {
  backing.splice(target.i, target.x)
  invert(source, target)
}

removeManyPatch.callWrapper = function (before, after, wrapper) {
  // removeMany can't easily passed through to a mutation handler, as the patch doesn't
  // keep an array of the items being removed - it keeps an array of arguments to splice
  // for fast inverting of the patch

  const argsToAddSplice = before.y
  for (let i = argsToAddSplice.length - 1; i >= 2; --i) {
    wrapper.remove(before.i + (i - 2), argsToAddSplice[i])
  }
}

function inverseRemoveManyPatch (backing, source, target) {
  backing.splice.apply(backing, target.y)
  invert(source, target)
}

inverseRemoveManyPatch.callWrapper = function (before, after, wrapper) {
  const argsToAddSplice = before.y
  for (let i = 2; i < argsToAddSplice.length; ++i) {
    wrapper.insert(before.i + (i - 2), argsToAddSplice[i])
  }
}

removeManyPatch.inverse = inverseRemoveManyPatch
inverseRemoveManyPatch.inverse = removeManyPatch

module.exports = removeManyPatch
