import _List from '../_List'
import { emptyListInstance } from '../_EmptyList'

describe('_List.shiftMany', () => {
  test('returns the same list if deleteCount is 0', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.shiftMany(0)).toBe(list)
  })

  test('returns an empty list if deleteCount is >= the size', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.shiftMany(3)).toBe(emptyListInstance)
    expect(list.shiftMany(4)).toBe(emptyListInstance)
    expect(list.shiftMany(5000)).toBe(emptyListInstance)
  })

  test('works for deleteCounts < the size', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.shiftMany(1).toJS()).toEqual(['b', 'c'])
    expect(list.shiftMany(2).toJS()).toEqual(['c'])
  })
})
