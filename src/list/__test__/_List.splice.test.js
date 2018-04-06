import _List from '../_List'
import { emptyListInstance } from '../_EmptyList';

describe('_List.splice', () => {
  test('returns this in cases where the result would be no different', () => {
    const list = new _List(['a', 'b', 'c', 'd', 'e'])

    expect(list.splice()).toBe(list)
    expect(list.splice(0, 0)).toBe(list)
    expect(list.splice(-3, 0)).toBe(list)
    expect(list.splice(0, 5, 'a', 'b', 'c', 'd', 'e')).toBe(list)
    expect(list.splice(2, 2, 'c', 'd')).toBe(list)
    expect(list.splice(-5, 5, 'a', 'b', 'c', 'd', 'e')).toBe(list)
  })

  test('returns an empty list when splicing out everything', () => {
    const list = new _List(['a', 'b', 'c', 'd', 'e'])

    expect(list.splice(0)).toBe(emptyListInstance)
    expect(list.splice(-5)).toBe(emptyListInstance)
    expect(list.splice(-6)).toBe(emptyListInstance)
    expect(list.splice(0, 5)).toBe(emptyListInstance)
    expect(list.splice(-5, 5)).toBe(emptyListInstance)
    expect(list.splice(-6, 5)).toBe(emptyListInstance)
    expect(list.splice(0, 50)).toBe(emptyListInstance)
    expect(list.splice(-8, 50)).toBe(emptyListInstance)
  })

  test('works with remove-only cases', () => {
    const list = new _List(['a', 'b', 'c', 'd', 'e'])

    expect(list.splice(0, 1).toJS()).toEqual(['b', 'c', 'd', 'e'])
    expect(list.splice(-5, 1).toJS()).toEqual(['b', 'c', 'd', 'e'])
    expect(list.splice(0, 2).toJS()).toEqual(['c', 'd', 'e'])
    expect(list.splice(-5, 2).toJS()).toEqual(['c', 'd', 'e'])
    expect(list.splice(0, 3).toJS()).toEqual(['d', 'e'])
    expect(list.splice(-5, 3).toJS()).toEqual(['d', 'e'])
    expect(list.splice(0, 4).toJS()).toEqual(['e'])
    expect(list.splice(-5, 4).toJS()).toEqual(['e'])

    expect(list.splice(3, 1).toJS()).toEqual(['a', 'b', 'c', 'e'])
    expect(list.splice(-2, 1).toJS()).toEqual(['a', 'b', 'c', 'e'])
    expect(list.splice(3, 2).toJS()).toEqual(['a', 'b', 'c'])
    expect(list.splice(-2, 2).toJS()).toEqual(['a', 'b', 'c'])
  })

  test('works with insert-only cases', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.splice(0, 0, 'foo').toJS()).toEqual(['foo', 'a', 'b', 'c'])
    expect(list.splice(1, 0, 'foo').toJS()).toEqual(['a', 'foo', 'b', 'c'])
    expect(list.splice(2, 0, 'foo').toJS()).toEqual(['a', 'b', 'foo', 'c'])
    expect(list.splice(3, 0, 'foo').toJS()).toEqual(['a', 'b', 'c', 'foo'])
    expect(list.splice(4, 0, 'foo').toJS()).toEqual(['a', 'b', 'c', 'foo'])

    expect(list.splice(0, 0, 'x', 'y', 'z').toJS()).toEqual(['x', 'y', 'z', 'a', 'b', 'c'])
    expect(list.splice(1, 0, 'x', 'y', 'z').toJS()).toEqual(['a', 'x', 'y', 'z', 'b', 'c'])
    expect(list.splice(2, 0, 'x', 'y', 'z').toJS()).toEqual(['a', 'b', 'x', 'y', 'z', 'c'])
    expect(list.splice(3, 0, 'x', 'y', 'z').toJS()).toEqual(['a', 'b', 'c', 'x', 'y', 'z'])
    expect(list.splice(4, 0, 'x', 'y', 'z').toJS()).toEqual(['a', 'b', 'c', 'x', 'y', 'z'])
  })

  test('works with replacement cases', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.splice(1, 1, 'x').toJS()).toEqual(['a', 'x', 'c'])
    expect(list.splice(1, 2, 'x', 'y').toJS()).toEqual(['a', 'x', 'y'])
  })

  test('works with general cases', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.splice(1, 2, 'x').toJS()).toEqual(['a', 'x'])
  })
})
