import _List from '../_List'
import { emptyListInstance } from '../_EmptyList'

describe('_List.shift', () => {
  test('returns the empty list instance from an empty list', () => {
    const list = new _List([])
    expect(list.shift()).toBe(emptyListInstance)
  })

  test('returns the empty list instance from a list of size 1', () => {
    const list = new _List(['a'])
    expect(list.shift()).toBe(emptyListInstance)
  })

  test('works from a list with elements', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.shift().toJS()).toEqual(['b', 'c'])
  })
})
