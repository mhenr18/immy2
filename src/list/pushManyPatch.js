// i = size of the old array (also the index of the new value)
// x = the new values
// y = <null>

function pushManyPatch (backing, i, x, y) {
  backing.push.apply(backing, x)
}

function inversePushManyPatch (backing, i, x, y) {
  backing.length -= x.length
}

pushManyPatch.inverse = inversePushManyPatch
inversePushManyPatch.inverse = pushManyPatch

export default pushManyPatch
