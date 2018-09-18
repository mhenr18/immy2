
// this wrapper does not support patches with multiple elements. these patches
// must be observed as multiple single-element changes.
//
// the exceptions to this are clear and insertMany, which exist to enable the
// disjoint set "change tracking" where we clear the old data and add the
// new data.

// returns true unless x === false
function r (x) {
  if (x === false) {
    return false
  } else {
    return true
  }
}

export default class SetObserverWrapper {
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

  insert (value) {
    if (!this.active) {
      return
    }

    this.active = r(this.observer.insert(value))
  }

  delete (value) {
    if (!this.active) {
      return
    }

    this.active = r(this.observer.delete(value))
  }

  clear (backing) {
    if (!this.active) {
      return
    }

    if (this.observer.clear) {
      this.active = r(this.observer.clear())
    } else {
      for (let value of backing) {
        if (!this.active) {
          break
        }

        this.delete(value)
      }
    }
  }

  insertMany (newValues) {
    if (!this.active) {
      return
    }

    if (this.observer.insertMany) {
      this.active = r(this.observer.insertMany(newValues))
    } else {
      for (let value of newValues) {
        if (!this.active) {
          break
        }

        this.insert(value)
      }
    }
  }
}
