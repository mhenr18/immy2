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
import JoinSelector from "./JoinSelector";

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

    const f = function (/* arguments */) {
      if (arguments.length < self.accepts.length) {
        throw new Error('not enough arguments for the selector - expected ' + self.accepts.join(', '))
      }

      for (let i = 0; i < self.accepts.length; ++i) {
        if (!typeCheck(arguments[i], self.accepts[i])) {
          throw new Error('incorrect argument types for the selector - expected ' + self.accepts.join(', '))
        }
      }

      let nextArg = 1
      let output = arguments[0]
      for (let s of self.selectors) {
        if (s.numArgs != null) {
          let args = []
          for (let i = 0; i < s.numArgs; ++i) {
            args.push(arguments[nextArg++])
          }

          output = s.select(output, args)
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

      f.groupBy = (grouper, valueSelector) => {
        return new SelectionPipeline([ ...this.selectors, new GroupBySelector(grouper, valueSelector) ], this.accepts, 'map').func()
      }

      f.toMap = () => {
        return new SelectionPipeline([ ...this.selectors, new ToMapSelector() ], this.accepts, 'map').func()
      }
    }

    if (this.emits === 'map') {
      f.ungroup = (ungrouper) => {
        return new SelectionPipeline([ ...this.selectors, new UngroupSelector(ungrouper) ], this.accepts, 'list').func()
      }

      f.join = (secondarySelector, joiner) => {
        if (secondarySelector.__pipeline == null) {
          throw new Error('.join() expects a secondary selector created by select()')
        }

        if (secondarySelector.__pipeline.emits !== 'map') {
          throw new Error('the secondary selector must emit a map')
        }

        return new SelectionPipeline(
          [ ...this.selectors, new JoinSelector(secondarySelector, joiner) ],
          [ ...this.accepts, ...secondarySelector.__pipeline.accepts ],
          'map'
        ).func()
      }
    }

    f.__pipeline = this
    return f
  }
}

export function fromList () {
  return new SelectionPipeline([], ['list'], 'list').func()
}

export function fromMap () {
  return new SelectionPipeline([], ['map'], 'map').func()
}

export function from (selector) {
  if (selector.__pipeline == null) {
    throw new Error('select.from() expects another selector created by select as its argument')
  }

  return selector
}
