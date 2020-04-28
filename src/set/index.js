import { emptySetInstance } from './_EmptySet'
import _Set from './_Set'

// awkward name due to needing to know about JS sets too
export default function SetCreator (collection, noCopy) {
  if (arguments.length === 0 || collection == null) {
    return emptySetInstance
  }

  if (collection instanceof Set) {
    if (collection.size === 0) {
      return emptySetInstance
    } else if (noCopy === true) {
      return new _Set(collection)
    } else {
      return new _Set(new Set(collection))
    }
  } else if (collection instanceof _Set) {
    return new _Set(new Set(collection._getBacking()))
  } else if (Array.isArray(collection)) {
    if (collection.length === 0) {
      return emptySetInstance
    }

    return new _Set(new Set(collection))
  } else if (collection != null) {
    let backing = new Set(collection)

    if (backing.size === 0) {
      return emptySetInstance
    }

    return new _Set(backing)
  }
}

export function isSet (x) {
  if (x == null) {
    return false
  }

  return x === emptySetInstance || x instanceof _Set
}
