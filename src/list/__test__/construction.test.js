import ImmyList from '../index'
import { emptyListInstance } from '../_EmptyList'

describe('ImmyList construction', () => {
  test('constructor with no arguments returns an empty list', () => {
    expect(ImmyList()).toBe(emptyListInstance)
  })

  test('empty list is returned when passed an empty array', () => {
    expect(ImmyList([])).toBe(emptyListInstance)
  })

  test('array construction works', () => {
    const list = ImmyList(['a', 'b', 'c'])
    expect(list.size).toBe(3)
    expect(list.toJS()).toEqual(['a', 'b', 'c'])
  })

  test('empty list is returned when using empty ES6 iterator', () => {
    function * emptyIterator () { }

    const list = ImmyList(emptyIterator())
    expect(list).toBe(emptyListInstance)
  })

  test('ES6 iterator construction works', () => {
    function * iterator () {
      yield 'a'
      yield 'b'
      yield 'c'
    }

    const list = ImmyList(iterator())
    expect(list.size).toBe(3)
    expect(list.toJS()).toEqual(['a', 'b', 'c'])
  })
})
