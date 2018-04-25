import MapSelector from './MapSelector'
import FilterSelector from './FilterSelector'

export function optimizeSelectors (selectors) {
  let optimized = []

  for (let selector of selectors) {
    if (optimized.length > 0) {
      const combined = combineIfPossible(optimized[optimized.length - 1], selector)

      if (combined == null) {
        optimized.push(selector)
      } else {
        optimized.pop()
        optimized.push(combined)
      }
    } else {
      optimized.push(selector)
    }
  }

  return optimized
}

// returns either a combined selector that does the job of a and b, or null
function combineIfPossible (a, b) {
  if (a instanceof MapSelector && b instanceof MapSelector) {
    // we can combine two maps into a single one
    const aMapper = a.mapper
    const bMapper = b.mapper
    const combinedMapper = (x) => bMapper(aMapper(x))

    return new MapSelector(combinedMapper)
  }

  if (a instanceof FilterSelector && b instanceof FilterSelector) {
    // we can combine two filter operations into a single one
    const aPredicate = a.predicate
    const bPredicate = b.predicate
    const combinedPredicate = (x) => aPredicate(x) && bPredicate(x)

    return new FilterSelector(combinedPredicate)
  }

  return null
}
