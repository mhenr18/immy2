// i = size of the new array (also the index of the value being popped)
// x = the value being popped
// y = <null>

function popOnePatch (backing, i, x, y) {
  backing.pop()
}

function inversePopOnePatch (backing, i, x, y) {
  backing.push(x)
}

popOnePatch.inverse = inversePopOnePatch
inversePopOnePatch.inverse = popOnePatch

export default popOnePatch
