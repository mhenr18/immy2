import _List from '../_List'

describe('_List.deleteWhere', () => {
  test('returns this if nothing needs to be deleted', () => {
    const list = new _List([1, 2, 3, 4, 5])
    expect(list.deleteWhere(x => x === 7)).toBe(list)
  })

  test('works when deleting a single element', () => {
    const list = new _List([1, 2, 3, 4, 5])
    expect(list.deleteWhere(x => x === 3).toJS()).toEqual([1, 2, 4, 5])
  })

  test('works when deleting a single element at the end', () => {
    const list = new _List([1, 2, 3, 4, 5])
    expect(list.deleteWhere(x => x === 5).toJS()).toEqual([1, 2, 3, 4])
  })

  test('works when deleting many elements at the end', () => {
    const list = new _List([1, 2, 3, 4, 5])
    expect(list.deleteWhere(x => x >= 3).toJS()).toEqual([1, 2])
  })

  test('works when deleting many runs of elements', () => {
    const list = new _List([1, 1, 1, 2, 2, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1])
    expect(list.deleteWhere(x => x === 2).toJS()).toEqual([1, 1, 1, 1, 1, 1, 1])
  })

  test('works with user defined values', () => {
    const list = new _List([1, 1, 1, 2, 2, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1])
    expect(list.deleteWhere(x => x, 2).toJS()).toEqual([1, 1, 1, 1, 1, 1, 1])
  })
})
