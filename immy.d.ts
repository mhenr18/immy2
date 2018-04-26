
declare module 'immy' {
  
  export function List<T>(): List<T>

  export interface ListObserver<T> {
    insert (index: number, newValue: T): void
    delete (index: number, oldValue: T): void

    push? (newValue: T): void
    pop? (oldValue: T): void
  }

  export interface List<T> {
    readonly size: number
    readonly root: {}

    set (index: number, value: T): List<T>
    get (index: number): T
    delete (index: number): List<T>
    insert (index: number, value: T): List<T>
    insertSorted <TKey> (value: T, keySelector?: (value: T) => TKey): List<T>
    indexOfSorted <TKey> (value: T, keySelector?: (value: T) => TKey): number
    binaryFindByKey <TKey> (targetKey: TKey, keySelector?: (value: T) => TKey, notSetValue?: T): T
    binaryFindIndexByKey <TKey> (targetKey: TKey, keySelector?: (value: T) => TKey): number
    binaryFindInsertionIndexByKey <TKey> (targetKey: TKey, keySelector?: (value: T) => TKey): number
    clear (): List<T>
    push (...values: T[]): List<T>
    pop (): List<T>
    popMany (deleteCount: number): List<T>
    unshift (...values: T[]): List<T>
    shift (): List<T>
    shiftMany (deleteCount: number): List<T>
    setSize (newSize: number): List<T>
    splice (index: number, removeNum: number, ...values: T[]): List<T>
    toArray (): T[]
    toJS (): T[]
    find (predicate: (value?: T, index?: number, list?: List<T>) => boolean, thisVal?: any, notSetValue?: T): T
    findIndex (predicate: (value?: T, index?: number, list?: List<T>) => boolean, thisVal?: any): number
    map <TMapped> (mapper: (value?: T, index?: number, list?: List<T>) => TMapped, thisVal?: any): List<TMapped>
    mapInPlace <TMapped> (mapper: (value?: T, index?: number, list?: List<T>) => TMapped, thisVal?: any): List<TMapped>
    filter (predicate: (value?: T, index?: number, list?: List<T>) => boolean, thisVal?: any): List<T>
    filterInPlace (predicate: (value?: T, index?: number, list?: List<T>) => boolean, thisVal?: any): List<T>
    observeChangesFor (otherList: List<T>, observer: ListObserver<T>): boolean
    toString (): string
    inspect (): string
  }

}
