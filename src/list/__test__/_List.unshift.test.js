import _List from '../_List'

describe('_List.unshift', () => {
  test('works from an empty list', () => {
    const list = new _List([])

    expect(list.unshift('a').toJS()).toEqual(['a'])
    expect(list.unshift('a', 'b', 'c').toJS()).toEqual(['a', 'b', 'c'])
  })

  test('works from a list with elements', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.unshift('foo').toJS()).toEqual(['foo', 'a', 'b', 'c'])
    expect(list.unshift('x', 'y', 'z').toJS()).toEqual(['x', 'y', 'z', 'a', 'b', 'c'])
  })

  test('returns the same list with no arguments', () => {
    const list = new _List(['a', 'b', 'c'])
    expect(list.unshift()).toBe(list)
  })
})
