// i = index of the first item being set
// x = the old values
// y = the new values

function setManyPatch (backing, i, x, y) {
  for (let j = 0; j < y.length; ++j) {
    backing[i + j] = y[j]
  }
}

function inverseSetManyPatch (backing, i, x, y) {
  for (let j = 0; j < x.length; ++j) {
    backing[i + j] = x[j]
  }
}

setManyPatch.inverse = inverseSetManyPatch
inverseSetManyPatch.inverse = setManyPatch

export default setManyPatch
