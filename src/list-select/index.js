import MapSelector from './MapSelector'
import FilterSelector from './FilterSelector'
import ReduceInitialValueSelector from './ReduceInitialValueSelector'
import ReduceNoInitialValueSelector from './ReduceNoInitialValueSelector'
import { optimizeSelectors } from './optimize'

function wrapSelectors (selectors) {
  selectors = optimizeSelectors(selectors)

  const wrapperFunc = (x) => {
    for (let selector of selectors) {
      x = selector.select(x)
    }

    return x
  }

  // only provide list operations if the final selector is one that produces a list
  if (selectors[selectors.length - 1] instanceof ReduceInitialValueSelector ||
    selectors[selectors.length - 1] instanceof ReduceNoInitialValueSelector
  ) {
    wrapperFunc.map = () => {
      throw new Error('unable to use list selection operations after a reduction')
    }

    wrapperFunc.filter = () => {
      throw new Error('unable to use list selection operations after a reduction')
    }

    wrapperFunc.reduce = () => {
      throw new Error('unable to use list selection operations after a reduction')
    }

    wrapperFunc.asType = () => {
      throw new Error('unable to use list selection operations after a reduction')
    }
  } else {
    wrapperFunc.map = (mapper) => {
      return wrapSelectors([...selectors, new MapSelector(mapper)])
    }
  
    wrapperFunc.filter = (predicate) => {
      return wrapSelectors([...selectors, new FilterSelector(predicate)])
    }

    // old-style function in order to access arguments object
    wrapperFunc.reduce = function (reducer, initialValue) {
      if (arguments.length > 1) {
        return wrapSelectors([...selectors, new ReduceInitialValueSelector(reducer, initialValue)])
      } else {
        return wrapSelectors([...selectors, new ReduceNoInitialValueSelector(reducer)])
      }
    }

    wrapperFunc.asType = () => {
      return wrapperFunc
    }
  }

  return wrapperFunc
}

export function map (mapper) {
  return wrapSelectors([new MapSelector(mapper)])
}

export function filter (predicate) {
  return wrapSelectors([new FilterSelector(predicate)])
}

export function reduce (reducer, initialValue) {
  if (arguments.length > 1) {
    return wrapSelectors([new ReduceInitialValueSelector(reducer, initialValue)])
  } else {
    return wrapSelectors([new ReduceNoInitialValueSelector(reducer)])
  }
}

// helper to make using typed JS languages easier - this is a no-op but has typings
// that allow for casting in the type system
export function asType () {
  return wrapSelectors([])
}
