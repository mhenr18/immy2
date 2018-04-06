import _List from '../_List'

describe('_List.push', () => {
  test('works from an empty list', () => {
    const list = new _List([])

    expect(list.push('a').toJS()).toEqual(['a'])
    expect(list.push('a', 'b', 'c').toJS()).toEqual(['a', 'b', 'c'])
  })

  test('works from a list with elements', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.push('foo').toJS()).toEqual(['a', 'b', 'c', 'foo'])
    expect(list.push('x', 'y', 'z').toJS()).toEqual(['a', 'b', 'c', 'x', 'y', 'z'])
  })

  test('returns the same list with no arguments', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.push()).toBe(list)
  })
})
