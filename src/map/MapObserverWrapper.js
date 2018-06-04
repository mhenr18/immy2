
// this wrapper does not support patches with multiple elements. these patches
// must be observed as multiple single-element changes.
//
// the exceptions to this are clear and insertMany, which exist to enable the
// disjoint map "change tracking" where we clear the old data and add the
// new data.

// returns true unless x === false
function r (x) {
  if (x === false) {
    return false
  } else {
    return true
  }
}

export default class MapObserverWrapper {
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

  insert (key, value) {
    if (!this.active) {
      return
    }

    this.active = r(this.observer.insert(key, value))
  }

  delete (key, value) {
    if (!this.active) {
      return
    }

    this.active = r(this.observer.delete(key, value))
  }

  clear (backing) {
    if (!this.active) {
      return
    }

    if (this.observer.clear) {
      this.active = r(this.observer.clear())
    } else {
      for (let [key, value] of backing) {
        if (!this.active) {
          break
        }

        this.delete(key, value)
      }
    }
  }

  insertMany (newKeysAndValues) {
    if (!this.active) {
      return
    }

    if (this.observer.insertMany) {
      this.active = r(this.observer.insertMany(newKeysAndValues))
    } else {
      for (let [key, value] of newKeysAndValues) {
        if (!this.active) {
          break
        }

        this.insert(key, value)
      }
    }
  }

  set (key, oldValue, newValue) {
    if (!this.active) {
      return
    }

    if (this.observer.set) {
      this.active = r(this.observer.set(key, oldValue, newValue))
    } else {
      this.active = r(this.observer.delete(key, oldValue))

      if (this.active) {
        this.active = r(this.observer.insert(key, newValue))
      }
    }
  }
}
