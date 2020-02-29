
// this wrapper does not support patches with multiple elements. these patches
// must be observed as multiple single-element changes.
//
// the exceptions to this are clear and pushMany, which exist to enable the
// disjoint list "change tracking" where we clear the old data and add the
// new data. pushMany is also called during regular usage, if it is available.
//
// note that push/pop/shift/unshift are called with the index as the second
// argument, rather than the first. (for API compatibility reasons, originally
// these methods didn't have the index given to them)

// returns true unless x === false
function r (x) {
  if (x === false) {
    return false
  } else {
    return true
  }
}

export default class ListObserverWrapper {
  constructor (observer) {
    this.observer = observer
    this.active = true

    if (!observer.insert) {
      throw new Error('observer must implement an insert method')
    }

    if (!observer.delete) {
      throw new Error('observer must implement a delete method')
    }
  }

  push (index, value) {
    if (!this.active) {
      return
    }

    if (this.observer.push) {
      this.active = r(this.observer.push(value))
    } else {
      this.active = r(this.observer.insert(index, value))
    }
  }

  pop (index, value) {
    if (!this.active) {
      return
    }

    if (this.observer.pop) {
      this.active = r(this.observer.pop(value))
    } else {
      this.active = r(this.observer.delete(index, value))
    }
  }

  unshift (value) {
    if (!this.active) {
      return
    }

    if (this.observer.unshift) {
      this.active = r(this.observer.unshift(value, index))
    } else {
      this.active = r(this.observer.insert(0, value))
    }
  }

  shift (value) {
    if (!this.active) {
      return
    }

    if (this.observer.shift) {
      this.active = r(this.observer.shift(value, index))
    } else {
      this.active = r(this.observer.delete(0, value))
    }
  }

  insert (index, value) {
    if (!this.active) {
      return
    }

    this.active = r(this.observer.insert(index, value))
  }

  delete (index, value) {
    if (!this.active) {
      return
    }

    this.active = r(this.observer.delete(index, value))
  }

  clear (backing) {
    if (!this.active) {
      return
    }

    if (this.observer.clear) {
      this.active = r(this.observer.clear())
    } else {
      for (let i = backing.length - 1; i >= 0 && this.active; --i) {
        this.pop(i, backing[i])
      }
    }
  }

  pushMany (startIndex, newValues) {
    if (!this.active) {
      return
    }

    if (this.observer.pushMany) {
      this.active = r(this.observer.pushMany(newValues))
    } else {
      for (let i = 0; i < newValues.length && this.active; ++i) {
        this.push(startIndex + i, newValues[i])
      }
    }
  }

  set (index, oldValue, newValue) {
    if (!this.active) {
      return
    }

    if (this.observer.set) {
      this.active = r(this.observer.set(index, oldValue, newValue))
    } else {
      this.active = r(this.observer.delete(index, oldValue))
      
      if (this.active) {
        this.active = r(this.observer.insert(index, newValue))
      }
    }
  }
}
