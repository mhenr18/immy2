
declare module 'immy' {
  
  // TODO: improve these typings
  export var select: any

  export function List<T>(): List<T>
  export function ImmyList<T>(): List<T>

  export interface ListObserver<T> {
    insert (index: number, newValue: T): void
    delete (index: number, oldValue: T): void

    push? (newValue: T): void
    pop? (oldValue: T): void
  }

  export type ImmyList<T> = List<T>

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
    [Symbol.iterator](): IterableIterator<T>
    forEach (sideEffect: (value?: T, index?: number, list?: List<T>) => any, thisVal?: any): number
    map <TMapped> (mapper: (value?: T, index?: number, list?: List<T>) => TMapped, thisVal?: any): List<TMapped>
    mapInPlace <TMapped> (mapper: (value?: T, index?: number, list?: List<T>) => TMapped, thisVal?: any): List<TMapped>
    filter (predicate: (value?: T, index?: number, list?: List<T>) => boolean, thisVal?: any): List<T>
    filterInPlace (predicate: (value?: T, index?: number, list?: List<T>) => boolean, thisVal?: any): List<T>
    observeChangesFor (otherList: List<T>, observer: ListObserver<T>): boolean
    toString (): string
    inspect (): string
  }

  export module listSelect {
    function map <T, TMapped> (mapper: (value: T) => TMapped): ListListSelector<T, TMapped>
    function filter <T> (predicate: (value: T) => boolean): ListListSelector<T, T>
    function asType <TNew> (): ListListSelector<TNew, TNew>

    function reduce <T> (
      reducer: (partialReduction: T, value: T) => T
    ): ListValueSelector<T, T>

    function reduce <T, TReduction> (
      reducer: (partialReduction: TReduction, value: T) => TReduction,
      initialValue: TReduction
    ): ListValueSelector<T, TReduction>
  }

  export type ListListSelector <TInput, TOutput> = {
    (list: List<TInput>): List<TOutput>

    map <TMapped> (mapper: (value: TOutput) => TMapped): ListListSelector<TInput, TMapped>
    filter (predicate: (value: TOutput) => boolean): ListListSelector<TInput, TOutput>
    asType <TNew> (): ListListSelector<TInput, TNew>

    reduce (
      reducer: (partialReduction: TOutput, value: TOutput) => TOutput
    ): ListValueSelector<TInput, TOutput>

    reduce <TReduction> (
      reducer: (partialReduction: TReduction, value: TOutput) => TReduction,
      initialValue: TReduction
    ): ListValueSelector<TInput, TReduction>
  }

  export type ListValueSelector <TInput, TValue> = {
    (list: List<TInput>): TValue
  }

  export module listCombine {
    function withList <TPrimary, TSecondary, TSecondaryKey, TCombined> (
      getSecondaryKey: (s: TSecondary) => TSecondaryKey,
      combinerFunc: (p: TPrimary, lookup: (key: TSecondaryKey) => TSecondary) => TCombined
    ): ListCombiner<TPrimary, TSecondary, TCombined>
  }

  export type ListCombiner <TPrimary, TSecondary, TCombined> = {
    (primary: List<TPrimary>, secondary: List<TSecondary>): List<TCombined>
  }

  export function Map<K, V>(): ImmyMap<K, V>
  export function ImmyMap<K, V>(): ImmyMap<K, V>

  export interface ImmyMapObserver<K, V> {
    insert (key: K, newValue: V): void
    delete (key: K, oldValue: V): void

    set? (key: K, oldValue: V, newValue: V): void
  }

  export interface ImmyMap<K, V> {
    readonly size: number
    readonly root: {}

    clear (): ImmyMap<K, V>
    set (key: K, value: V): ImmyMap<K, V>
    get (key): V  
    has (key): boolean
    delete (key): ImmyMap<K, V>
    toMap (): Map<K, V>
    toJS (): Map<K, V>
    [Symbol.iterator] (): IterableIterator<[K, V]>
    observeChangesFor (otherMap: ImmyMap<K, V>, observer: ImmyMapObserver<K, V>): boolean  
    toString (): string
    inspect (): string
  }
}
