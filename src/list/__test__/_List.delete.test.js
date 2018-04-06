import _List from '../_List'

describe('_List.delete', () => {
  test('works with in-bounds positive indexes', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.delete(0).toJS()).toEqual(['b', 'c'])
    expect(list.delete(1).toJS()).toEqual(['a', 'c'])
    expect(list.delete(2).toJS()).toEqual(['a', 'b'])
  })

  test('works with in-bounds negative indexes', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.delete(-1).toJS()).toEqual(['a', 'b'])
    expect(list.delete(-2).toJS()).toEqual(['a', 'c'])
    expect(list.delete(-3).toJS()).toEqual(['b', 'c'])
  })

  test('works with out of bounds positive indexes', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.delete(3).toJS()).toEqual(['a', 'b'])
    expect(list.delete(5000).toJS()).toEqual(['a', 'b'])
  })

  test('works with out of bounds negative indexes', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.delete(-4).toJS()).toEqual(['b', 'c'])
    expect(list.delete(-9000).toJS()).toEqual(['b', 'c'])
  })
})
