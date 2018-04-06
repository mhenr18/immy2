import _List from '../_List'
import { emptyListInstance } from '../_EmptyList';

describe('_List.setSize', () => {
  test('returns an empty list if the new size is 0', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.setSize(0)).toBe(emptyListInstance)
  })

  test('returns this if the new size is the same as this.size', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.setSize(3)).toBe(list)
  })

  test('works when shrinking the list', () => {
    const list = new _List(['a', 'b', 'c', 'd', 'e', 'f', 'g'])
    expect(list.setSize(4).toJS()).toEqual(['a', 'b', 'c', 'd'])
  })

  test('works when gorwing the list', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.setSize(5).toJS()).toEqual(['a', 'b', 'c', undefined, undefined])
  })
})
