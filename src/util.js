
export function formatObj (x) {
  if (typeof x === 'string') {
    return '"' + x + '"'
  } else {
    return JSON.stringify(x)
  }
}
