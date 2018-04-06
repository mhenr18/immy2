const { invert } = require('./invert')

// i = <unused>
// x = the item to be pushed on
// y = <unused>

function pushOnePatch (backing, source, target) {
  backing.push(target.x)
  invert(source, target)
}

pushOnePatch.callWrapper = function (before, after, wrapper) {
  wrapper.pushOne(before.size, before.x)
}

function inversePushOnePatch (backing, source, target) {
  backing.pop()
  invert(source, target)
}

inversePushOnePatch.callWrapper = function (before, after, wrapper) {
  wrapper.popOne(after.size, before.x)
}

pushOnePatch.inverse = inversePushOnePatch
inversePushOnePatch.inverse = pushOnePatch

module.exports = pushOnePatch
