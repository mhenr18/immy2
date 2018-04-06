import { emptyListInstance } from './_EmptyList'
import _List from './_List'

export default function List (collection) {
  if (collection == null) {
    return emptyListInstance
  }

  if (Array.isArray(collection)) {
    if (collection.length === 0) {
      return emptyListInstance
    } else {
      return new _List(collection.slice())
    }
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
