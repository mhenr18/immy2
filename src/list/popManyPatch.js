// i = size of the new array (also the index of the first value being popped)
// x = the values being popped
// y = <null>

function popManyPatch (backing, i, x, y) {
  backing.length -= x.length
}

function inversePopManyPatch (backing, i, x, y) {
  backing.push.apply(backing, x)
}

popManyPatch.inverse = inversePopManyPatch
inversePopManyPatch.inverse = popManyPatch

export default popManyPatch
