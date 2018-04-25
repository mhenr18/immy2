import _List from '../_List'

describe('_List.transform', () => {
  test('returns this if everything mapped into itself', () => {
    const list = new _List([1, 2, 3, 4, 5])
    expect(list.transform(x => x)).toBe(list)
  })

  test('makes a minimal transform', () => {
    const list = new _List([1, 2, 3, 4, 5])
    const transformed = list.transform(x => {
      if (x === 3) {
        return x + 2
      } else {
        return x
      }
    })

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      set: jest.fn()
    }

    list.observeChangesFor(transformed, observer)

    expect(transformed.toJS()).toEqual([1, 2, 5, 4, 5])
    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.set.mock.calls).toEqual([
      [2, 3, 5]
    ])
  })

  test('makes a more comprehensive transform', () => {
    const list = new _List([1, 2, 2, 2, 1, 2, 1, 2])
    const transformed = list.transform(x => {
      if (x === 2) {
        return x + 6
      } else {
        return x
      }
    })

    let observer = {
      insert: jest.fn(),
      delete: jest.fn(),
      set: jest.fn()
    }

    list.observeChangesFor(transformed, observer)

    expect(transformed.toJS()).toEqual([1, 8, 8, 8, 1, 8, 1, 8])
    expect(observer.insert).not.toHaveBeenCalled()
    expect(observer.delete).not.toHaveBeenCalled()
    expect(observer.set.mock.calls).toEqual([
      [1, 2, 8],
      [2, 2, 8],
      [3, 2, 8],
      [5, 2, 8],
      [7, 2, 8]
    ])
  })
})
