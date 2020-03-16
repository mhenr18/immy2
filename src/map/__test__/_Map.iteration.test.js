import _Map from '../_Map'
import { emptyMapInstance } from '../_EmptyMap'

// for performance reasons, Maps directly iterate over their backings.
// this creates problems if the backing needs to be mutated, either because another
// Map needs to access its backing or to be able to .set()/etc on this map.
//
// to deal with this, maps are designed to duplicate backings and prevent mutation
// of backings being iterated over - these tests ensure that this logic actually works.

describe('_Map iteration', () => {
  test('basic iteration works', () => {
    let aSrc = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3]
    ])

    let a = new _Map(aSrc)

    let iterResults = new Map()
    for (let [k, v] of a) {
      iterResults.set(k, v)
    }

    expect(aSrc).toEqual(iterResults)
  })

  test('accessing other maps with the same root works while iterating', () => {
    let aSrc = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3]
    ])

    let a = new _Map(aSrc)
    let b = a.set('d', 4)
    let c = b.set('e', 5)

    let iterResults = new Map()
    for (let [k, v] of c) {
      expect(a.get('a')).toEqual(1)
      iterResults.set(k, v)
    }

    expect(iterResults).toEqual(new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['d', 4],
      ['e', 5]
    ]))
  })

  test('interleaved iteration should work', () => {
    let a = new _Map(new Map())
      .set('a', 1)
      .set('b', 2)
      .set('c', 3)

    let b = a
      .set('d', 4)
      .set('e', 5)
      .delete('a')
      .delete('b')

    let aExpected = a.toJS()
    let bExpected = b.toJS()

    let aIter = a[Symbol.iterator]()
    let bIter = b[Symbol.iterator]()

    let aResults = new Map()
    let bResults = new Map()

    for (let i = 0; i < 3; ++i) {
      const aValue = aIter.next().value
      const bValue = bIter.next().value

      aResults.set(aValue[0], aValue[1])
      bResults.set(bValue[0], bValue[1])
    }

    expect(aIter.next().done).toEqual(true)
    expect(bIter.next().done).toEqual(true)
    expect(aResults).toEqual(aExpected)
    expect(bResults).toEqual(bExpected)
  })
})
