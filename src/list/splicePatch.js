// i = index of the splice
// x = arguments to make the splice
// y = arguments to invert the splice

function splicePatch (backing, i, x, y) {
  backing.splice.apply(backing, x)
}

function inverseSplicePatch (backing, i, x, y) {
  backing.splice.apply(backing, y)
}

splicePatch.inverse = inverseSplicePatch
inverseSplicePatch.inverse = splicePatch

export default splicePatch
