import { emptyListInstance } from '../_EmptyList'
import _List from '../_List'

describe('_EmptyList', () => {

  test('set works with positive indexes', () => {
    const b = emptyListInstance.set(3, 'foobar')
    
    expect(b.toJS()).toEqual([undefined, undefined, undefined, 'foobar'])
  })

  test('set works with negative indexes', () => {
    const b = emptyListInstance.set(-3, 'foobar')

    expect(b.size).toBe(3)
    expect(b.toJS()).toEqual(['foobar', undefined, undefined])
  })

  test('get should always return undefined', () => {
    expect(emptyListInstance.get(-2)).toBeUndefined()
    expect(emptyListInstance.get(-1)).toBeUndefined()
    expect(emptyListInstance.get(0)).toBeUndefined()
    expect(emptyListInstance.get(1)).toBeUndefined()
    expect(emptyListInstance.get(2)).toBeUndefined()
  })

  test('delete should return the empty list', () => {
    expect(emptyListInstance.delete(1)).toBe(emptyListInstance)
  })

  test('insert works with positive indexes', () => {
    expect(emptyListInstance.insert(3, 'foo').toJS()).toEqual(['foo'])
    expect(emptyListInstance.insert(9000, 'foo').toJS()).toEqual(['foo'])
  })

  test('insert works with negative indexes', () => {
    expect(emptyListInstance.insert(-4, 'foo').toJS()).toEqual(['foo'])
    expect(emptyListInstance.insert(-9000, 'foo').toJS()).toEqual(['foo'])
  })

  test('clear should return the empty list', () => {
    expect(emptyListInstance.clear()).toBe(emptyListInstance)
  })

  test('map should return the empty list', () => {
    expect(emptyListInstance.map(x => x + 1)).toBe(emptyListInstance)
  })

  test('filter should return the empty list', () => {
    expect(emptyListInstance.filter(x => x != null)).toBe(emptyListInstance)
  })

  test('reduce should the initial value', () => {
    expect(emptyListInstance.reduce((a, b) => a + b)).toBe(undefined)
    expect(emptyListInstance.reduce((a, b) => a + b, 0)).toBe(0)
    expect(emptyListInstance.reduce((a, b) => a + b, 10)).toBe(10)
  })

  test('push should work', () => {
    expect(emptyListInstance.push('a').toJS()).toEqual(['a'])
    expect(emptyListInstance.push('a', 'b', 'c').toJS()).toEqual(['a', 'b', 'c'])
  })

  test('pop should return the empty list', () => {
    expect(emptyListInstance.pop()).toBe(emptyListInstance)
  })

  test('popMany should return the empty list', () => {
    expect(emptyListInstance.popMany(0)).toBe(emptyListInstance)
    expect(emptyListInstance.popMany(1)).toBe(emptyListInstance)
    expect(emptyListInstance.popMany(2)).toBe(emptyListInstance)
    expect(emptyListInstance.popMany(3)).toBe(emptyListInstance)
  })

  test('unshift should work', () => {
    expect(emptyListInstance.unshift('a').toJS()).toEqual(['a'])
    expect(emptyListInstance.unshift('a', 'b', 'c').toJS()).toEqual(['a', 'b', 'c'])
  })

  test('shift should return the empty list', () => {
    expect(emptyListInstance.shift()).toBe(emptyListInstance)
  })

  test('shiftMany should return the empty list', () => {
    expect(emptyListInstance.shiftMany(0)).toBe(emptyListInstance)
    expect(emptyListInstance.shiftMany(1)).toBe(emptyListInstance)
    expect(emptyListInstance.shiftMany(2)).toBe(emptyListInstance)
    expect(emptyListInstance.shiftMany(3)).toBe(emptyListInstance)
  })

  test('setSize(0) should return the empty list', () => {
    expect(emptyListInstance.setSize(0)).toBe(emptyListInstance)
  })

  test('setSize(N) should return an actual list', () => {
    expect(emptyListInstance.setSize(1)._backing).toEqual([undefined])
    expect(emptyListInstance.setSize(2)._backing).toEqual([undefined, undefined])
    expect(emptyListInstance.setSize(3)._backing).toEqual([undefined, undefined, undefined])
  })

  test('observeChangesFor should do nothing if given the empty list', () => {

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    emptyListInstance.observeChangesFor(emptyListInstance, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
  })

  test('observeChangesFor should pushMany the otherList', () => {
    let a = emptyListInstance
    let b = new _List(['x', 'y', 'z'])

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      pushMany: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.pushMany.mock.calls).toEqual([
      [['x', 'y', 'z']]
    ])
  })
})
