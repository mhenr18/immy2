import _List from '../_List'
import { emptyListInstance } from '../_EmptyList'

// test cases for things too simple to deserve their own files

describe('_List.toArray and _List.toJS', () => {
  test('returns the correct array', () => {
    expect(new _List(['a', 'b', 'c']).toArray()).toEqual(['a', 'b', 'c'])
    expect(new _List(['a', 'b', 'c']).toJS()).toEqual(['a', 'b', 'c'])
  })

  test('returns an empty array if the list is empty', () => {
    expect(new _List([]).toArray()).toEqual([])
    expect(new _List([]).toJS()).toEqual([])
  })
})

describe('_List.expand', () => {
  test('returns the same list', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.expand()).toBe(list)
  })
})

describe('_List.clear', () => {
  test('returns an empty list', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.clear()).toBe(emptyListInstance)
  })
})

describe('_List.toString and _List.inspect', () => {
  test('works with numbers', () => {
    const list = new _List([2, 4, 6])
    expect(list.toString()).toBe('ImmyList(3) [ 2, 4, 6 ]')
    expect(list.inspect()).toBe('ImmyList(3) [ 2, 4, 6 ]')
  })

  test('works with strings', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.toString()).toBe('ImmyList(3) [ "a", "b", "c" ]')
    expect(list.inspect()).toBe('ImmyList(3) [ "a", "b", "c" ]')
  })
})
