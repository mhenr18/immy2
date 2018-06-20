
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

// keys are allowed to be arrays, which means order by [0], then by [1]
export function compareKeys (a, b) {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || b.length !== a.length) {
      throw new Error('when using array keys, both args must be arrays and both must have the same length')
    }

    console.log('comparing arrays')

    for (let i = 0; i < a.length; ++i) {
      if (a[i] < b[i]) {
        return -1
      } else if (b[i] < a[i]) {
        return 1
      }
    }

    return 0
  } else {
    if (a < b) {
      return -1
    } else if (b < a) {
      return 1
    } else {
      return 0
    }
  }
}
