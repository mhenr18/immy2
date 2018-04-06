// i = size of the old array (also the index of the new value)
// x = the new value
// y = <null>

function pushOnePatch (backing, i, x, y) {
  backing.push(x)
}

function inversePushOnePatch (backing, i, x, y) {
  backing.pop()
}

pushOnePatch.inverse = inversePushOnePatch
inversePushOnePatch.inverse = pushOnePatch

export default pushOnePatch
