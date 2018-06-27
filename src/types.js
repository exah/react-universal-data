// @flow

import type {
  ComponentType,
  ElementType
} from 'react'

type DataStoreType = {
  init: (value?: Object) => void,
  save: (id: number, value: any) => void,
  nextId: () => number,
  getById: (id: number) => any,
  get: () => Object
}

type DataCompStateType = {
  isLoading: boolean,
  error: any,
  data: any
}

type GetDataFnType = (context: Object) => Promise<Object | boolean>

type DataCompChildType = {
  getData?: GetDataFnType
} & $Subtype<ComponentType<any>>

export type {
  ComponentType,
  ElementType,
  GetDataFnType,
  DataStoreType,
  DataCompStateType,
  DataCompChildType
}
