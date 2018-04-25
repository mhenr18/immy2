
export default class ReduceInitialValueSelector {

  constructor (reducer, initialValue) {
    // this.reducer/this.initialValue are public API
    this.reducer = reducer
    this.initialValue = initialValue
  }

  select (srcList) {
    return srcList.reduce(this.reducer, this.initialValue)
  }

}
