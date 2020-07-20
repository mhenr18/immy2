import ImmyList, { isList } from './list'
import * as listSelect from './list-select'
import * as listCombine from './list-combine'
import * as select from './select'

import ImmyMap, { isMap } from './map'
import ImmySet, { isSet } from './set'

import { compareKeys } from './util'

export {
  ImmyList,
  ImmyList as List,
  listSelect,
  listCombine,
  select,

  ImmyMap,
  ImmyMap as Map,

  ImmySet,
  ImmySet as Set,

  isList as isImmyList,
  isMap as isImmyMap,
  isSet as isImmySet,

  compareKeys as compareOrderableKeys
}

export default {
  ImmyList,
  List: ImmyList,
  listSelect,
  listCombine,
  select,

  ImmyMap,
  Map: ImmyMap,

  ImmySet,
  Set: ImmySet,

  isImmyList: isList,
  isImmyMap: isMap,
  isImmySet: isSet,

  compareOrderableKeys: compareKeys
}
