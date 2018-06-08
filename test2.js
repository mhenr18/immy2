const Immy = require('./dist/Immy')
const Immutable = require('immutable')

function slowEvens (list) {
  return list.filter(x => x % 2 === 0)
}

const fastEvens = Immy.select
  .fromList()
  .filter(x => x % 2 === 0)


let N = 1000000

function runTest () {
  let arr = []
  for (let i = 0; i < N; ++i) {
    arr.push(i)
  }

  let immutableBefore = Immutable.List(arr)
  let immyBefore = Immy.List(arr)

  console.time('immutable before')
  let immutableEvensBefore = slowEvens(immutableBefore)
  console.timeEnd('immutable before')

  console.time('immy before')
  let immyEvensBefore = fastEvens(immyBefore)
  console.timeEnd('immy before')

  let immutableAfter = immutableBefore.push(42)
  let immyAfter = immyBefore.push(42)

  console.time('immutable after')
  let immutableEvensAfter = slowEvens(immutableAfter)
  console.timeEnd('immutable after')

  console.time('immy after')
  let immyEvensAfter = fastEvens(immyAfter)
  console.timeEnd('immy after')
}

runTest()
runTest()
runTest()
runTest()
runTest()
runTest()

console.log()
console.log()
console.log()
console.log()

runTest()
