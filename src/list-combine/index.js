import ListListCombiner from './ListListCombiner'

// combination where the primary and secondary are both lists.

export function withList (getSecondaryKey, combinerFunc) {
  const combiner = new ListListCombiner(getSecondaryKey, combinerFunc)

  return (primary, secondary) => {
    return combiner.combine(primary, secondary)
  }
}
