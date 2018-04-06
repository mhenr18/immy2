import _List from '../_List'
import { emptyListInstance } from '../_EmptyList'

describe('_List.popMany', () => {
  test('returns the same list if deleteCount is 0', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.popMany(0)).toBe(list)
  })

  test('returns an empty list if deleteCount is >= the size', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.popMany(3)).toBe(emptyListInstance)
    expect(list.popMany(4)).toBe(emptyListInstance)
    expect(list.popMany(5000)).toBe(emptyListInstance)
  })

  test('works for deleteCounts < the size', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.popMany(1).toJS()).toEqual(['a', 'b'])
    expect(list.popMany(2).toJS()).toEqual(['a'])
  })
})
