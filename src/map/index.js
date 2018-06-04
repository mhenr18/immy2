import { emptyMapInstance } from './_EmptyMap'
import _Map from './_Map'

// awkward name due to needing to know about JS maps too
export default function MapCreator (collection, noCopy) {
  if (arguments.length === 0) {
    return emptyMapInstance
  }

  if (collection instanceof Map) {
    if (collection.size === 0) {
      return emptyMapInstance
    } else if (noCopy === true) {
      return new _Map(collection)
    } else {
      return new _Map(new Map(collection))
    }
  } else if (collection instanceof _Map) {
    return new _Map(new Map(collection._getBacking()))
  } else {
    let backing = new Map(collection)

    if (backing.size === 0) {
      return emptyMapInstance
    }

    return new _Map()
  }
}
