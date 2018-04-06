const { invert } = require('./invert')

// i = <unused>
// x = arguments used to make the splice
// y = arguments used to invert the splice

function splicePatch (backing, source, target) {
  backing.splice.apply(backing, target.x)
  invert(source, target)
}

splicePatch.callWrapper = function (before, after, wrapper) {
  // like the removeManyPatch, the splice patch doesn't keep arrays of what was
  // added/removed, it keeps arrays of what's needed to invert the splices as
  // efficiently as possible.
  //
  // this means that we have to individually remove/add the elements, as we don't
  // want to pass that through to the mutation handlers.

  const index = before.x[0]
  const numToRemove = before.x[1]
  const argsToInvertSplice = before.y
  const argsToApplySplice = before.x

  if (index + numToRemove === before.size) {
    for (let i = argsToInvertSplice.length - 1; i >= 2; --i) {
      wrapper.popOne(index + (i - 2), argsToInvertSplice[i])
    }

    for (let i = 2; i < argsToApplySplice.length; ++i) {
      wrapper.pushOne(index + (i - 2), argsToApplySplice[i])
    }
  } else {
    for (let i = argsToInvertSplice.length - 1; i >= 2; --i) {
      wrapper.remove(index + (i - 2), argsToInvertSplice[i])
    }

    for (let i = 2; i < argsToApplySplice.length; ++i) {
      wrapper.insert(index + (i - 2), argsToApplySplice[i])
    }
  }
}

function inverseSplicePatch (backing, source, target) {
  backing.splice.apply(backing, target.y)
  invert(source, target)
}

inverseSplicePatch.callWrapper = function (before, after, wrapper) {
  const index = before.x[0]
  const numToRemove = before.x[1]
  const argsToInvertSplice = before.x
  const argsToApplySplice = before.y

  if (index + numToRemove === before.size) {
    for (let i = argsToInvertSplice.length - 1; i >= 2; --i) {
      wrapper.popOne(index + (i - 2), argsToInvertSplice[i])
    }

    for (let i = 2; i < argsToApplySplice.length; ++i) {
      wrapper.pushOne(index + (i - 2), argsToApplySplice[i])
    }
  } else {
    for (let i = argsToInvertSplice.length - 1; i >= 2; --i) {
      wrapper.remove(index + (i - 2), argsToInvertSplice[i])
    }

    for (let i = 2; i < argsToApplySplice.length; ++i) {
      wrapper.insert(index + (i - 2), argsToApplySplice[i])
    }
  }
}

splicePatch.inverse = inverseSplicePatch
inverseSplicePatch.inverse = splicePatch

module.exports = splicePatch
