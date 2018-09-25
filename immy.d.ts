
declare module 'immy' {
  
  // TODO: improve these typings
  export var select: any

  export function List<T>(valuesArr?: T[], noCopy?: boolean): ImmyList<T>
  export function ImmyList<T>(valuesArr?: T[], noCopy?: boolean): ImmyList<T>

  export interface ListObserver<T> {
    insert (index: number, newValue: T): void
    delete (index: number, oldValue: T): void

    push? (newValue: T): void
    pop? (oldValue: T): void
    set? (index: number, oldValue: T, newValue: T): void
  }

  export interface ImmyList<T> {
    readonly size: number
    readonly root: {}

    count (): number
    first (): T
    last (): T
    isEmpty (): boolean
    set (index: number, value: T): ImmyList<T>
    get (index: number): T
    delete (index: number): ImmyList<T>
    insert (index: number, value: T): ImmyList<T>
    insertSorted <TKey> (value: T, keySelector?: (value: T) => TKey): ImmyList<T>
    updateSorted <TKey> (value: T, keySelector?: (value: T) => TKey): ImmyList<T>
    deleteSorted <TKey> (value: T, keySelector?: (value: T) => TKey): ImmyList<T>
    indexOfSorted <TKey> (value: T, keySelector?: (value: T) => TKey): number
    binaryFindByKey <TKey> (targetKey: TKey, keySelector?: (value: T) => TKey, notSetValue?: T): T
    binaryFindIndexByKey <TKey> (targetKey: TKey, keySelector?: (value: T) => TKey): number
    binaryFindInsertionIndexByKey <TKey> (targetKey: TKey, keySelector?: (value: T) => TKey): number
    clear (): ImmyList<T>
    push (...values: T[]): ImmyList<T>
    pop (): ImmyList<T>
    popMany (deleteCount: number): ImmyList<T>
    unshift (...values: T[]): ImmyList<T>
    shift (): ImmyList<T>
    shiftMany (deleteCount: number): ImmyList<T>
    setSize (newSize: number): ImmyList<T>
    splice (index: number, removeNum?: number): ImmyList<T>
    splice (index: number, removeNum: number, ...values: T[]): ImmyList<T>
    toArray (): T[]
    toList (): ImmyList<T>
    toJS (): T[]
    toSet (): ImmySet<T>
    find (predicate: (value?: T, index?: number, list?: ImmyList<T>) => boolean, thisVal?: any, notSetValue?: T): T
    findIndex (predicate: (value?: T, index?: number, list?: ImmyList<T>) => boolean, thisVal?: any): number
    [Symbol.iterator](): IterableIterator<T>
    forEach (sideEffect: (value?: T, index?: number, list?: ImmyList<T>) => any, thisVal?: any): number
    map <TMapped> (mapper: (value?: T, index?: number, list?: ImmyList<T>) => TMapped, thisVal?: any): ImmyList<TMapped>
    pureMap <TMapped> (mapper: (value?: T) => TMapped): ImmyList<TMapped>
    mapInPlace <TMapped> (mapper: (value?: T, index?: number, list?: ImmyList<T>) => TMapped, thisVal?: any): ImmyList<TMapped>
    reduce <TReduction> (
      reducer: (reduction: TReduction, value?: T, index?: number, list?: ImmyList<T>) => TReduction,
      initialReduction?: TReduction,
      thisVal?: any
    ): TReduction
    filter (predicate: (value?: T, index?: number, list?: ImmyList<T>) => boolean, thisVal?: any): ImmyList<T>
    filterInPlace (predicate: (value?: T, index?: number, list?: ImmyList<T>) => boolean, thisVal?: any): ImmyList<T>
    sort (comparator?: (valueA: C, valueB: C) => number): ImmyList<T>
    sortBy<C> (comparatorValueMapper: (value: T, key: number, iter: ImmyList<T>) => C, comparator?: (valueA: C, valueB: C) => number): ImmyList<T>
    flatMap<M> (mapper: (value: T, key: number, iter: ImmyList<T>) => Iterable<M>, thisVal?: any): ImmyList<M>
    groupBy<G> (grouper: (value: T, key: number, iter: ImmyList<T>) => G, thisVal?: any): ImmyMap<G, ImmyList<T>>
    observeChangesFor (otherList: ImmyList<T>, observer: ListObserver<T>): boolean
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
    (list: ImmyList<TInput>): ImmyList<TOutput>

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
    (list: ImmyList<TInput>): TValue
  }

  export module listCombine {
    function withList <TPrimary, TSecondary, TSecondaryKey, TCombined> (
      getSecondaryKey: (s: TSecondary) => TSecondaryKey,
      combinerFunc: (p: TPrimary, lookup: (key: TSecondaryKey) => TSecondary) => TCombined
    ): ListCombiner<TPrimary, TSecondary, TCombined>
  }

  export type ListCombiner <TPrimary, TSecondary, TCombined> = {
    (primary: ImmyList<TPrimary>, secondary: ImmyList<TSecondary>): ImmyList<TCombined>
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
    forEach (sideEffect: (value?: V, key?: K, map?: ImmyMap<K, V>) => any, thisVal?: any): number
    map<M> (mapper: (value: V, key: K, map: ImmyMap<V>) => M, thisVal?: any): ImmyMap<K, M>
    filter (predicate: (value?: T, key?: K, map?: ImmyMap<K, V>) => boolean, thisVal?: any): ImmyMap<K, V>
    toList (): ImmyList<V>
    toSet (): ImmySet<V>
    toMap (): Map<K, V>
    toJS (): Map<K, V>
    [Symbol.iterator] (): IterableIterator<[K, V]>
    observeChangesFor (otherMap: ImmyMap<K, V>, observer: ImmyMapObserver<K, V>): boolean  
    toString (): string
    inspect (): string
  }








  export function Set<T>(): ImmySet<T>
  export function Set<T>(values: Set<T>): ImmySet<T>
  export function Set<T>(values: T[]): ImmySet<T>
  export function ImmySet<T>(): ImmySet<T>
  export function ImmySet<T>(values: Set<T>): ImmySet<T>
  export function ImmySet<T>(values: T[]): ImmySet<T>

  export interface ImmySetObserver<T> {
    insert (newValue: T): void
    delete (oldValue: T): void
  }

  export interface ImmySet<T> {
    readonly size: number
    readonly root: {}
    first(): T
    count(): number
    clear (): ImmySet<T>
    add (value): ImmySet<T> 
    has (value): boolean
    delete (value): ImmySet<T>
    toSet (): ImmySet<T>
    toArray(): T[]
    toJS (): Set<T>
    toList (): ImmyList<T>
    forEach (sideEffect: (value?: T, key?: T, set?: ImmySet<T>) => any, thisVal?: any): number
    [Symbol.iterator] (): IterableIterator<T>
    observeChangesFor (otherSet: ImmySet<T>, observer: ImmySetObserver<T>): boolean  
    toString (): string
    inspect (): string
  }
}
