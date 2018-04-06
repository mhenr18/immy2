// i = index of the item being set
// x = the old value
// y = the new value

function setOnePatch (backing, i, x, y) {
  backing[i] = y
}

function inverseSetOnePatch (backing, i, x, y) {
  backing[i] = x
}

setOnePatch.inverse = inverseSetOnePatch
inverseSetOnePatch.inverse = setOnePatch

export default setOnePatch
