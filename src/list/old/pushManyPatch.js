const { invert } = require('./invert')

// i = <unused>
// x = an array of the items to be pushed on
// y = <unused>

function pushManyPatch (backing, source, target) {
  backing.push.apply(backing, target.x)
  invert(source, target)
}

pushManyPatch.callWrapper = function (before, after, wrapper) {
  wrapper.pushMany(before.size, before.x)
}

function inversePushManyPatch (backing, source, target) {
  backing.length -= target.x.length
  invert(source, target)
}

inversePushManyPatch.callWrapper = function (before, after, wrapper) {
  wrapper.popMany(after.size, before.x)
}

pushManyPatch.inverse = inversePushManyPatch
inversePushManyPatch.inverse = pushManyPatch

module.exports = pushManyPatch
