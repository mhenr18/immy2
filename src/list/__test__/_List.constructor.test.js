import _List from '../_List'

describe('_List.constructor', () => {
  test('sets the correct size', () => {
    expect(new _List(['a', 'b', 'c']).size).toBe(3)
  })
})
