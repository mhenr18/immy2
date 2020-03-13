
declare module 'immy' {
  type SelectBase = {
    from<TSource, Out>(selector: ListSelector<TSource, Out>): ListSelector<TSource, Out>
    from<TSource, OutK, OutV>(selector: MapSelector<TSource, OutK, OutV>): MapSelector<TSource, OutK, OutV>
    fromList<T>(): ListSelector<ImmyList<T>, T>
    fromMap<K, V>(): MapSelector<ImmyMap<K, V>, K, V>
  }

  type Orderable = string | number | null | undefined | (string | number | null | undefined)[]

  interface ListSelectorBase <TSource, Out> {
    (source: TSource): ImmyList<Out>

    filter (predicate: (value: Out) => boolean): ListSelector<TSource, Out>
    map <T> (mapper: (value: Out) => T): ListSelector<TSource, T>
    flatMap <T> (mapper: (value: Out) => Iterable<T>): ListSelector<TSource, T>

    orderBy (orderSelector: (value: Out) => Orderable): ListSelector<TSource, Out>
    sort (comparator: (a: Out, b: Out) => number): ListSelector<TSource, Out>

    groupBy <K> (grouper: (value: Out) => K): MapSelector<TSource, K, ImmyList<Out>>
    groupBy <K, V> (grouper: (value: Out) => K, valueSelector: (value: Out) => V): MapSelector<TSource, K, ImmyList<V>>

    trace (): ListSelector<TSource, Out>
  }

  type IterableListSelector <TSource, OutV, Out extends Iterable<OutV>> = {
    flatten (): ListSelector<TSource, OutV>
  }

  type OrderableListSelector <TSource, OutV extends Orderable> = {
    sort (): ListSelector<TSource, OutV>
  }

  type ToMapListSelector <TSource, K, V, OutV extends [K, V]> = {
    toMap (): MapSelector<TSource, K, V>
  }

  type ListSelector <TSource, Out> = ListSelectorBase<TSource, Out> &
    (Out extends Iterable<infer U> ? IterableListSelector<TSource, U, Out> : {}) &
    (Out extends Orderable ? OrderableListSelector<TSource, Out> : {}) &
    (Out extends [infer K, infer V] ? ToMapListSelector<TSource, K, V, Out> : {})

  interface MapSelectorBase <TSource, OutK, OutV> {
    (source: TSource): ImmyMap<OutK, OutV>

    map <T> (mapper: (value: OutV) => T): MapSelector<TSource, OutK, T>
    values (): ListSelector<TSource, OutV>
    keys (): ListSelector<TSource, OutK>
    trace (): MapSelector<TSource, OutK, OutV>
    filterByValue (predicate: (value: OutV) => boolean): MapSelector<TSource, OutK, OutV>
  }

  type GroupedMapSelector <TSource, OutK, Out, OutV extends ImmyList<Out>> = {
    ungroup (): ListSelector<TSource, Out>
    ungroup <T> (ungrouper: (value: Out, key: OutK) => T): ListSelector<TSource, T>
  }

  type MapSelector <TSource, OutK, OutV> = MapSelectorBase<TSource, OutK, OutV> &
    (OutV extends ImmyList<infer U> ? GroupedMapSelector<TSource, OutK, U, OutV> : {})
  
  export var select: SelectBase

  export function List<T>(valuesArr?: T[], noCopy?: boolean): ImmyList<T>
  export function ImmyList<T>(valuesArr?: T[], noCopy?: boolean): ImmyList<T>

  export interface ListObserver<T> {
    insert (index: number, newValue: T): void
    delete (index: number, oldValue: T): void

    push? (newValue: T): void
    pop? (oldValue: T): void
    set? (index: number, oldValue: T, newValue: T): void
  }

  export interface ImmyListBase <T> {
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
    indexOf (val: T): number
    find (predicate: (value: T, index: number, list: ImmyList<T>) => boolean, thisVal?: any, notSetValue?: T): T
    findIndex (predicate: (value: T, index: number, list: ImmyList<T>) => boolean, thisVal?: any): number
    [Symbol.iterator](): IterableIterator<T>
    forEach (sideEffect: (value: T, index: number, list: ImmyList<T>) => any, thisVal?: any): number
    map <TMapped> (mapper: (value: T, index: number, list: ImmyList<T>) => TMapped, thisVal?: any): ImmyList<TMapped>
    pureMap <TMapped> (mapper: (value: T) => TMapped): ImmyList<TMapped>
    mapInPlace <TMapped> (mapper: (value: T, index: number, list: ImmyList<T>) => TMapped, thisVal?: any): ImmyList<TMapped>
    reduce <TReduction> (
      reducer: (reduction: TReduction, value: T, index: number, list: ImmyList<T>) => TReduction,
      initialReduction?: TReduction,
      thisVal?: any
    ): TReduction
    filter<S extends T>(predicate: (value: T, index: number, list: ImmyList<T>) => value is S, thisArg?: any): ImmyList<S>
    filter(predicate: (value: T, index: number, list: ImmyList<T>) => boolean, thisVal?: any): ImmyList<T>
    filterInPlace (predicate: (value: T, index: number, list: ImmyList<T>) => boolean, thisVal?: any): ImmyList<T>
    sort (comparator: (valueA: T, valueB: T) => number): ImmyList<T>

    sortBy (comparatorValueMapper: (value: T, key: number, iter: ImmyList<T>) => Orderable): ImmyList<T>
    sortBy<C> (comparatorValueMapper: (value: T, key: number, iter: ImmyList<T>) => C, comparator: (valueA: C, valueB: C) => number): ImmyList<T>
    flatMap<M> (mapper: (value: T, key: number, iter: ImmyList<T>) => Iterable<M>, thisVal?: any): ImmyList<M>
    groupBy<G> (grouper: (value: T, key: number, iter: ImmyList<T>) => G, thisVal?: any): ImmyMap<G, ImmyList<T>>
    observeChangesFor (otherList: ImmyList<T>, observer: ListObserver<T>): boolean

    /** calculates the diff between this list and the otherList (using === equality of elements), and applies
     *  that diff to this list. the result is a set of changes applied that work nicely with change tracking.
     * 
     * this is an experimental API that has not yet been rigorously tested or optimized. it works best with
     * sorted lists.
     */
    experimental_applyChangesFor (otherList: ImmyList<T>): ImmyList<T>
    toString (): string
    inspect (): string
  }

  export type SortableImmyList <T extends Orderable> = {
    sort (): ImmyList<T>
  }

  export type ImmyList <T> = ImmyListBase<T> &
    (T extends Orderable ? SortableImmyList<T> : {})

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

  export function Map<K, V>(valuesMap?: Map<K, V>, noCopy?: boolean): ImmyMap<K, V>
  export function ImmyMap<K, V>(valuesMap?: Map<K, V>, noCopy?: boolean): ImmyMap<K, V>

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
    get (key: K): V  
    has (key: K): boolean
    delete (key: K): ImmyMap<K, V>
    forEach (sideEffect: (value: V, key: K, map: ImmyMap<K, V>) => any, thisVal?: any): number
    map<M> (mapper: (value: V, key: K, map: ImmyMap<K, V>) => M, thisVal?: any): ImmyMap<K, M>
    filter (predicate: (value: V, key: K, map: ImmyMap<K, V>) => boolean, thisVal?: any): ImmyMap<K, V>
    toList (): ImmyList<V>
    toSet (): ImmySet<V>
    toMap (): ImmyMap<K, V>
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
    add (value: T): ImmySet<T> 
    has (value: T): boolean
    delete (value: T): ImmySet<T>
    toSet (): ImmySet<T>
    toArray(): T[]
    toJS (): Set<T>
    toList (): ImmyList<T>
    forEach (sideEffect: (value: T, key: T, set: ImmySet<T>) => any, thisVal?: any): number
    [Symbol.iterator] (): IterableIterator<T>
    observeChangesFor (otherSet: ImmySet<T>, observer: ImmySetObserver<T>): boolean  
    toString (): string
    inspect (): string
  }
}
