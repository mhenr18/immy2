import _List from '../_List'
import { emptyListInstance } from '../_EmptyList'

// a lot of this file's tests are going to be ones specifically designed
// to cover particular branches rather than having too much meaning from
// an API consumer's point of view.
//
// they're basically "ensure that in a situation where a certain bit of
// code has to run, everything works OK".

describe('_List.observeChangesFor', () => {
  test('throws if insert is not provided', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = emptyListInstance

    let observer = {
      delete: jest.fn()
    }

    expect(() => a.observeChangesFor(b, observer)).toThrow()
    expect(observer.delete).not.toHaveBeenCalled()
  })

  test('throws if delete is not provided', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = emptyListInstance

    let observer = {
      insert: jest.fn()
    }

    expect(() => a.observeChangesFor(b, observer)).toThrow()
    expect(observer.insert).not.toHaveBeenCalled()
  })


  test('clears if given an empty list', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = emptyListInstance

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.clear).toHaveBeenCalled()
  })

  test('pops if given an empty list and the observer has no clear', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = emptyListInstance

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      pop: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.pop.mock.calls).toEqual([
      ['c'],
      ['b'],
      ['a']
    ])
  })

  test('deletes if given an empty list and the observer has no clear or pop', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = emptyListInstance

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).toHaveBeenCalledTimes(3)
    expect(observer.delete.mock.calls).toEqual([
      [2, 'c'],
      [1, 'b'],
      [0, 'a']
    ])
  })

  test('clears and then calls pushMany if given a disjoint list', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = new _List(['x', 'y', 'z'])

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      pushMany: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.clear).toHaveBeenCalledTimes(1)
    expect(observer.pushMany.mock.calls).toEqual([
      [['x', 'y', 'z']]
    ])
  })

  test('calls push N times if given a disjoint list and no pushMany', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = new _List(['x', 'y', 'z'])

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      push: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.clear).toHaveBeenCalledTimes(1)
    expect(observer.push.mock.calls).toEqual([
      ['x'],
      ['y'],
      ['z']
    ])
  })

  test('does not call anything if given itself', () => {
    let a = new _List(['a', 'b', 'c'])

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    a.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
  })

  test('calls insert correctly', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.insert(1, 'x')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).toHaveBeenCalledTimes(1)
    expect(observer.insert).toHaveBeenCalledWith(1, 'x')
    expect(observer.delete).not.toHaveBeenCalled()
  })

  test('uses the insertPatch invertWrapper', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.insert(1, 'x')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.delete).toHaveBeenCalledTimes(1)
    expect(observer.delete).toHaveBeenCalledWith(1, 'x')
    expect(observer.insert).not.toHaveBeenCalled()
  })

  test('calls delete correctly', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.delete(1)

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.delete).toHaveBeenCalledTimes(1)
    expect(observer.delete).toHaveBeenCalledWith(1, 'b')
    expect(observer.insert).not.toHaveBeenCalled()
  })

  test('uses the deletePatch invertWrapper', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.delete(1)

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).toHaveBeenCalledTimes(1)
    expect(observer.insert).toHaveBeenCalledWith(1, 'b')
    expect(observer.delete).not.toHaveBeenCalled()
  })

  test('calls push correctly', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.push('d')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      push: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.push).toHaveBeenCalledTimes(1)
    expect(observer.push).toHaveBeenCalledWith('d')
  })

  test('calls insert if push is not defined', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.push('d')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.insert).toHaveBeenCalledTimes(1)
    expect(observer.insert).toHaveBeenCalledWith(3, 'd')
  })


  test('uses the pushOnePatch invertWrapper', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.push('d')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      pop: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.pop).toHaveBeenCalledTimes(1)
    expect(observer.pop).toHaveBeenCalledWith('d')
  })

  test('calls pushMany correctly', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.push('d', 'e', 'f')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      pushMany: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.pushMany).toHaveBeenCalledTimes(1)
    expect(observer.pushMany).toHaveBeenCalledWith(['d', 'e', 'f'])
  })

  test('uses the pushMany patch invertWrapper', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.push('d', 'e', 'f')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      pop: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.pop.mock.calls).toEqual([
      ['f'],
      ['e'],
      ['d']
    ])
  })

  test('uses the growPatch applyWrapper', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.setSize(6)

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      push: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.push.mock.calls).toEqual([
      [undefined],
      [undefined],
      [undefined]
    ])
  })

  test('uses the growPatch invertWrapper', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.setSize(6)

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      pop: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.pop.mock.calls).toEqual([
      [undefined],
      [undefined],
      [undefined]
    ])
  })

  test('uses the popMany applyWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.popMany(4)

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      pop: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.pop.mock.calls).toEqual([
      ['e'],
      ['d'],
      ['c'],
      ['b']
    ])
  })

  test('uses the popMany invertWrapper, calling pushMany', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.popMany(4)

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      pushMany: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.pushMany).toHaveBeenCalledTimes(1)
    expect(observer.pushMany).toHaveBeenCalledWith(['b', 'c', 'd', 'e'])
  })

  test('uses the popOne applyWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.pop()

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      pop: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.pop.mock.calls).toEqual([
      ['e']
    ])
  })

  test('uses the popOne invertWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.pop()

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      push: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.push.mock.calls).toEqual([
      ['e']
    ])
  })

  test('uses the setMany applyWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.splice(1, 3, 'x', 'y', 'z')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      set: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.set.mock.calls).toEqual([
      [1, 'b', 'x'],
      [2, 'c', 'y'],
      [3, 'd', 'z']
    ])
  })

  test('uses the setMany invertWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.splice(1, 3, 'x', 'y', 'z')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      set: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.set.mock.calls).toEqual([
      [1, 'x', 'b'],
      [2, 'y', 'c'],
      [3, 'z', 'd']
    ])
  })

  test('uses the setOne applyWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.set(2, 'foo')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      set: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.set.mock.calls).toEqual([
      [2, 'c', 'foo']
    ])
  })

  test('calls delete and insert if set is not provided', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.set(2, 'foo')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.delete.mock.calls).toEqual([
      [2, 'c']
    ])

    expect(observer.insert.mock.calls).toEqual([
      [2, 'foo']
    ])
  })

  test('uses the setOne invertWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.set(2, 'foo')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      set: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.set.mock.calls).toEqual([
      [2, 'foo', 'c']
    ])
  })

  test('uses the shiftMany applyWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.splice(0, 3)

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      shift: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.shift.mock.calls).toEqual([
      ['a'],
      ['b'],
      ['c']
    ])
  })

  test('uses the shiftMany invertWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.splice(0, 3)

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      unshift: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.unshift.mock.calls).toEqual([
      ['c'],
      ['b'],
      ['a']
    ])
  })

  test('uses the shiftOne applyWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.shift()

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      shift: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.shift.mock.calls).toEqual([
      ['a']
    ])
  })

  test('uses the shiftOne invertWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.shift()

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      unshift: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.unshift.mock.calls).toEqual([
      ['a']
    ])
  })

  test('uses the unshiftMany applyWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.unshift('x', 'y', 'z')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      unshift: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.unshift.mock.calls).toEqual([
      ['z'],
      ['y'],
      ['x']
    ])
  })

  test('uses the unshiftMany invertWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.unshift('x', 'y', 'z')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      shift: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.shift.mock.calls).toEqual([
      ['x'],
      ['y'],
      ['z']
    ])
  })

  test('uses the unshiftOne applyWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.unshift('foo')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      unshift: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.unshift.mock.calls).toEqual([
      ['foo']
    ])
  })

  test('uses the unshiftOne invertWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.unshift('foo')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      shift: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.shift.mock.calls).toEqual([
      ['foo']
    ])
  })

  test('calls insert if unshift is not defined', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.unshift('foo')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.insert).toHaveBeenCalledTimes(1)
    expect(observer.insert).toHaveBeenCalledWith(0, 'foo')
  })

  test('calls delete if shift is not defined', () => {
    let a = new _List(['a', 'b', 'c'])
    let b = a.shift()

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).toHaveBeenCalledTimes(1)
    expect(observer.delete).toHaveBeenCalledWith(0, 'a')
  })


  test('uses the splice applyWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.splice(1, 3, 'x', 'y')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    a.observeChangesFor(b, observer)

    expect(observer.delete.mock.calls).toEqual([
      [1, 'b'],
      [1, 'c'],
      [1, 'd']
    ])

    expect(observer.insert.mock.calls).toEqual([
      [1, 'x'],
      [2, 'y']
    ])
  })

  test('uses the splice invertWrapper', () => {
    let a = new _List(['a', 'b', 'c', 'd', 'e'])
    let b = a.splice(1, 3, 'x', 'y')

    let observer = {
      insert: jest.fn(),
      delete: jest.fn()
    }

    b.observeChangesFor(a, observer)

    expect(observer.delete.mock.calls).toEqual([
      [1, 'x'],
      [1, 'y']
    ])

    expect(observer.insert.mock.calls).toEqual([
      [1, 'b'],
      [2, 'c'],
      [3, 'd']
    ])
  })
})
