import _List from "../list/_List";
import { emptyListInstance } from "../list/_EmptyList";
import _Map from "../map/_Map";
import { emptyMapInstance } from "../map/_EmptyMap";
import FilterSelector from "./FilterSelector";
import MapSelector from './MapSelector'
import GroupBySelector from "./GroupBySelector";
import ToMapSelector from "./ToMapSelector";
import OrderBySelector from "./OrderBySelector";
import UngroupSelector from "./UngroupSelector";
import KeysSelector from "./KeysSelector";
import JoinSelector from "./JoinSelector";
import ListTracer from './ListTracer'
import MapTracer from './MapTracer'
import SortSelector from "./SortSelector";

function typeCheck (x, typeName) {
  if (typeName === 'list') {
    return x instanceof _List || x === emptyListInstance
  } else if (typeName === 'map') {
    return x instanceof _Map || x === emptyMapInstance
  } else {
    throw new Error('unknown typeName: ' + typeName)
  }
}

class SelectionPipeline {
  constructor (selectors, accepts, emits) {
    this.selectors = selectors
    this.accepts = accepts
    this.emits = emits
  }

  func () {
    const self = this

    const f = function (originalInput) {
      if (!typeCheck(originalInput, self.accepts)) {
        throw new Error('incorrect argument type for the selector - expected ' + self.accepts)
      }

      let output = arguments[0]
      for (let s of self.selectors) {
        if (s.needsOriginalInput) {
          output = s.select(output, arguments[0])
        } else {
          output = s.select(output)
        }
      }

      return output
    }

    if (this.emits === 'list') {
      f.filter = (predicate) => {
        return new SelectionPipeline([ ...this.selectors, new FilterSelector(predicate) ], this.accepts, 'list').func()
      }

      f.map = (mapper) => {
        return new SelectionPipeline([ ...this.selectors, new MapSelector(mapper) ], this.accepts, 'list').func()
      }

      f.orderBy = (orderSelector) => {
        return new SelectionPipeline([ ...this.selectors, new OrderBySelector(orderSelector) ], this.accepts, 'list').func()
      }

      f.sort = (comparator) => {
        return new SelectionPipeline([ ...this.selectors, new SortSelector(comparator) ], this.accepts, 'list').func()
      }

      f.groupBy = (grouper, valueSelector) => {
        return new SelectionPipeline([ ...this.selectors, new GroupBySelector(grouper, valueSelector) ], this.accepts, 'map').func()
      }

      f.toMap = () => {
        return new SelectionPipeline([ ...this.selectors, new ToMapSelector() ], this.accepts, 'map').func()
      }

      f.trace = (name) => {
        return new SelectionPipeline([ ...this.selectors, new ListTracer(name) ], this.accepts, this.emits).func() 
      }
    }

    if (this.emits === 'map') {
      f.ungroup = (ungrouper) => {
        return new SelectionPipeline([ ...this.selectors, new UngroupSelector(ungrouper) ], this.accepts, 'list').func()
      }

      f.keys = () => {
        return new SelectionPipeline([ ...this.selectors, new KeysSelector() ], this.accepts, 'list').func()
      }

      f.join = (secondarySelector, joiner) => {
        if (secondarySelector.__pipeline == null) {
          throw new Error('.join() expects a secondary selector created by select()')
        }

        if (secondarySelector.__pipeline.emits !== 'map') {
          throw new Error('the secondary selector must emit a map')
        }

        if (secondarySelector.__pipeline.accepts !== this.accepts) {
          throw new Error('the secondary selector must accept the same input')
        }

        return new SelectionPipeline(
          [ ...this.selectors, new JoinSelector(secondarySelector, joiner) ],
          this.accepts,
          'map'
        ).func()
      }

      f.trace = (name) => {
        return new SelectionPipeline([ ...this.selectors, new MapTracer(name) ], this.accepts, this.emits).func() 
      }
    }

    f.__pipeline = this
    return f
  }
}

export function fromList () {
  return new SelectionPipeline([], 'list', 'list').func()
}

export function fromMap () {
  return new SelectionPipeline([], 'map', 'map').func()
}

export function from (selector) {
  if (selector.__pipeline == null) {
    throw new Error('select.from() expects another selector created by select as its argument')
  }

  return selector
}

