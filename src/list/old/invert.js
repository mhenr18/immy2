
function invert (source, target) {
  target.backing = source.backing
  source.patchSource = target
  source.patchFunc = target.patchFunc.inverse
  source.i = target.i
  source.x = target.x
  source.y = target.y
  
  source.backing = null
  target.patchSource = null

  // you don't actually *need* to do this due to these values never
  // being used on the target, but this is done to make debugging easier
  // by ensuring that they'll always be useless values
  target.patchFunc = null
  target.i = -1
  target.x = null
  target.y = null
}

exports.invert = invert
