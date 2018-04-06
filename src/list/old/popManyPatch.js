const { invert } = require('./invert')

// i = <unused>
// x = the items being popped off the list
// y = <unused>

function popManyPatch (backing, source, target) {
  backing.length -= target.x.length
  invert(source, target)
}

popManyPatch.callWrapper = function (before, after, wrapper) {
  wrapper.popMany(after.size, before.x)
}

function inversePopManyPatch (backing, source, target) {
  backing.push.apply(backing, target.x)
  invert(source, target)
}

inversePopManyPatch.callWrapper = function (before, after, wrapper) {
  wrapper.pushMany(before.size, before.x)
}

popManyPatch.inverse = inversePopManyPatch
inversePopManyPatch.inverse = popManyPatch

module.exports = popManyPatch
