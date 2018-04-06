
function MutationHandlerWrapper (handler) {
  this.handler = handler

  if (handler.insert == null) {
    throw new Error('handler must implement an insert function')
  }

  if (handler.remove == null) {
    throw new Error('handler must implement a remove function')
  }
}

MutationHandlerWrapper.prototype.insert = function (index, value) {
  this.handler.insert(index, value)
}

MutationHandlerWrapper.prototype.remove = function (index, value) {
  this.handler.remove(index, value)
}

MutationHandlerWrapper.prototype.clear = function (list) {
  if (list.size === 0) {
    return // nothing to clear
  }

  if (this.handler.clear) {
    // note - the list *isn't* passed to the handler. it's only passed to the
    // wrapper so that clearing can be translated into lots of remove() calls
    // if needed.
    this.handler.clear() 
  } else {
    for (let i = list.size - 1; i >= 0; --i) {
      this.pop(i, list.get(i))
    }
  }
}

MutationHandlerWrapper.prototype.pushOne = function (index, value) {
  if (this.handler.pushOne) {
    this.handler.pushOne(value)
  } else {
    this.handler.insert(index, value)
  }
}

MutationHandlerWrapper.prototype.pushMany = function (index, values) {
  if (this.handler.pushMany) {
    this.handler.pushMany(values)
  } else {
    for (let i = 0; i < values.length; ++i) {
      this.pushOne(index + i, values[i])
    }
  }
}

MutationHandlerWrapper.prototype.popOne = function (index, value) {
  if (this.handler.popOne) {
    this.handler.popOne(value)
  } else {
    this.handler.remove(index, value)
  }
}

MutationHandlerWrapper.prototype.popMany = function (index, values) {
  if (this.handler.popMany) {
    this.handler.popMany(values)
  } else {
    for (let i = values.length - 1; i >= 0; --i) {
      this.popOne(index + i, values[i])
    }
  }
}

MutationHandlerWrapper.prototype.set = function (index, value) {
  if (this.handler.set) {
    this.handler.set(index, value)
  } else {
    this.handler.remove(index, value)
    this.handler.insert(index, value)
  }
}

module.exports = MutationHandlerWrapper
