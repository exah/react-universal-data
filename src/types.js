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

type DataCompChildType = {
  getData?: (any) => Promise<any>
} & $Subtype<ComponentType<any>>

export type {
  DataStoreType,
  ComponentType,
  ElementType,
  DataCompStateType,
  DataCompChildType
}
