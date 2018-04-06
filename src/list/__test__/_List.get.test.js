import _List from '../_List'

describe('_List.get', () => {
  test('returns undefined when accessing an out of bounds index', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.get(3)).toBeUndefined()
    expect(list.get(4)).toBeUndefined()
    expect(list.get(-4)).toBeUndefined()
    expect(list.get(-5)).toBeUndefined()
  })

  test('works with positive indexes', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.get(0)).toBe('a')
    expect(list.get(1)).toBe('b')
    expect(list.get(2)).toBe('c')
  })

  test('works with negative indexes', () => {
    const list = new _List(['a', 'b', 'c'])

    expect(list.get(-1)).toBe('c')
    expect(list.get(-2)).toBe('b')
    expect(list.get(-3)).toBe('a')
  })
})
