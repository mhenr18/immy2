import { emptyListInstance } from './_EmptyList'
import _List from './_List'

export default function ImmyList (collection, noCopy) {
  if (arguments.length === 0) {
    return emptyListInstance
  }

  if (Array.isArray(collection)) {
    if (collection.length === 0) {
      return emptyListInstance
    } else if (noCopy === true) {
      return new _List(collection)
    } else {
      return new _List(collection.slice())
    }
  } else if (collection instanceof _List) {
    return new _List(collection._getBacking().slice())
  } else {
    let backing = []

    for (let value of collection) {
      backing.push(value)
    }

    if (backing.length === 0) {
      return emptyListInstance
    }

    return new _List(backing)
  }
}

export function isList (x) {
  if (x == null) {
    return false
  }

  return x === emptyListInstance || x instanceof _List
}
