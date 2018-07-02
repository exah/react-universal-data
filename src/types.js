// @flow

import type {
  ComponentType,
  Element as ReactElement
} from 'react'

type DataStoreType = {
  init: (value?: Object) => void,
  save: (id: number, value: any) => void,
  nextId: () => number,
  getById: (id: number) => any,
  get: () => Object
}

type State = {
  isLoading: boolean,
  error: Error | null,
  data: any
}

type Props = $Shape<{
  id: string | number,
  match: Object,
  location: Object,
  isLoading: boolean,
  error: Error | null
}>

/**
 * Function that returns Promise with props for `withData` wrapped component.
 * First argument is **Object** with `isClient`, `isServer` flags, parent component props and context from `getAppInitialData`.
 *
 * @example
 *
 * const getData = ({ isClient, isServer, ...parentProps }) => Promise.resolve({
 *   message: isServer ? 'server' : 'client'
 * })
 */

type GetDataFn = (context: Object) => Promise<Object | boolean>

type WrappedComponentType = {
  getData?: GetDataFn
} & $Subtype<ComponentType<any>>

type HOC = (WrappedComponentType) => ComponentType<any>

export type {
  ComponentType,
  ReactElement,
  GetDataFn,
  DataStoreType,
  HOC,
  State,
  Props,
  WrappedComponentType
}
