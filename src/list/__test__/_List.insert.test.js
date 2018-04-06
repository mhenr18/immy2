import _List from '../_List'

describe('_List.insert', () => {
  test('works with in-bounds positive indexes', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.insert(0, 'foo').toJS()).toEqual(['foo', 'a', 'b', 'c'])
    expect(list.insert(1, 'foo').toJS()).toEqual(['a', 'foo', 'b', 'c'])
    expect(list.insert(2, 'foo').toJS()).toEqual(['a', 'b', 'foo', 'c'])
  })

  test('works with in-bounds negative indexes', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.insert(-3, 'foo').toJS()).toEqual(['foo', 'a', 'b', 'c'])
    expect(list.insert(-2, 'foo').toJS()).toEqual(['a', 'foo', 'b', 'c'])
    expect(list.insert(-1, 'foo').toJS()).toEqual(['a', 'b', 'foo', 'c'])
  })

  test('works with out of bounds positive indexes', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.insert(3, 'foo').toJS()).toEqual(['a', 'b', 'c', 'foo'])
    expect(list.insert(9000, 'foo').toJS()).toEqual(['a', 'b', 'c', 'foo'])
  })

  test('works with out of bounds negative indexes', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.insert(-4, 'foo').toJS()).toEqual(['foo', 'a', 'b', 'c'])
    expect(list.insert(-9000, 'foo').toJS()).toEqual(['foo', 'a', 'b', 'c'])
  })
})
