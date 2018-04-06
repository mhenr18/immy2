const { invert } = require('./invert')

// i = <unused>
// x = the item being popped off the list
// y = <unused>

function popOnePatch (backing, source, target) {
  backing.pop()
  invert(source, target)
}

popOnePatch.callWrapper = function (before, after, wrapper) {
  wrapper.popOne(after.size, before.x)
}

function inversePopOnePatch (backing, source, target) {
  backing.push(target.x)
  invert(source, target)
}

inversePopOnePatch.callWrapper = function (before, after, wrapper) {
  wrapper.pushOne(before.size, before.x)
}

popOnePatch.inverse = inversePopOnePatch
inversePopOnePatch.inverse = popOnePatch

module.exports = popOnePatch
