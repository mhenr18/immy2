import _List from '../_List'

describe('_List.set', () => {
  test('works with positive indexes', () => {
    const a = new _List(['a', 'b', 'c'])
    const b = a.set(1, 'foobar')

    expect(b.toJS()).toEqual(['a', 'foobar', 'c'])
  })

  test('works with negative indexes', () => {
    const a = new _List(['a', 'b', 'c'])
    const b = a.set(-1, 'foobar')

    expect(b.toJS()).toEqual(['a', 'b', 'foobar'])
  })

  test('works with positive indexes equal to size', () => {
    const a = new _List(['a', 'b', 'c'])
    const b = a.set(3, 'foobar')
    
    expect(b.toJS()).toEqual(['a', 'b', 'c', 'foobar'])
  })

  test('works with positive indexes greater than size', () => {
    const a = new _List(['a', 'b', 'c'])
    const b = a.set(5, 'foobar')

    expect(b.size).toBe(6)
    expect(b.toJS()).toEqual(['a', 'b', 'c', undefined, undefined, 'foobar'])
  })

  test('works with negative indexes less than size', () => {
    const a = new _List(['a', 'b', 'c'])
    const b = a.set(-6, 'foobar')

    expect(b.size).toBe(6)
    expect(b.toJS()).toEqual(['foobar', undefined, undefined, 'a', 'b', 'c'])
  })
})
