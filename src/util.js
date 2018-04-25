
export function formatObj (x) {
  if (typeof x === 'string') {
    return '"' + x + '"'
  } else {
    return JSON.stringify(x)
  }
}

export function makePatch (desc) {
  const { name, apply, applyWrapper, invertName, invert, invertWrapper } = desc

  apply._name = name
  apply.inverse = invert
  invert._name = invertName
  invert.inverse = apply

  apply.callWrapper = applyWrapper
  invert.callWrapper = invertWrapper

  return apply
}
