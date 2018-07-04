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
  data: ? Array<any>,
  isLoading: boolean,
  error: Error | null
}>

/**
 * Function that returns Promise with props for `withData` wrapped component.
 * First argument is **Object** with `isClient`, `isServer` flags, parent component props and context from `getInitialData`.
 *
 * If returned value is `false`, `null` or `undefined`, component will use previous data in state, also
 * in `getInitialData` `false` value will prevent requesting data inside that element tree.
 *
 * @example
 *
 * const getData = ({ isClient, isServer, ...parentProps }) =>
 *   Promise.resolve({ message: isServer ? 'server' : 'client' })
 *
 * withData(getData)(Comp)
 *
 * // SSR
 * // Comp props -> { message: 'server' }
 *
 * // Client (after update)
 * // Comp props -> { message: 'client' }
 *
 * @example
 *
 * const getData = (contextProps, prevData) =>
 *   prevData // this is update
 *     ? Promise.resolve(null) // data in state will not update
 *     : Promise.resolve({ message: 'ok' })
 *
 * withData(getData)(Comp)
 *
 * // Comp props -> { message: 'ok' }
 *
 * @example
 *
 * const getData = (contextProps, prevData) =>
 *   Promise.resolve([ 1, 2, 3, 4 ]) // arrays will be passed as `data` prop
 *
 * withData(getData)(Comp)
 *
 * // Comp props -> { data: [ 1, 2, 3, 4 ] }
 */

type GetDataFn = (context: Object, prevData: Object) => Promise<{} | [] | boolean | null>

/**
 * Function that checks if new data should be requested with `GetDataFn` when receiving new props.
 *
 * By default it compares [React Router](https://reacttraining.com/react-router) [`match.params`](https://reacttraining.com/react-router/web/api/match), [`location.pathname`](https://reacttraining.com/react-router/web/api/location), `location.search` props. Also you can change `id` prop on component to indicate update.
 *
 * ```js
 * const defaultShouldDataUpdate = (prev, next) => {
 *   if (prev.match && prev.location) {
 *     return !(
 *       shallowEqual(prev.match.params, next.match.params) &&
 *       prev.location.pathname === next.location.pathname &&
 *       prev.location.search === next.location.search
 *     )
 *   }
 *
 *   return prev.id !== next.id
 * }
 * ```
 *
 * @example
 *
 * // update data only on lang change
 * withData(
 *   (props) => api.getPage({ slug: props.slug, lang: props.lang }),
 *   (prevProps, nextProps) => prevProps.lang !== nextProps.lang
 * )
 *
 * @example
 *
 * // request data once
 * withData(
 *   () => api.getSomeStuff(),
 *   () => false
 * )
 *
 * @example
 *
 * // Default update behaviour
 * const Comp = withData(() => api.getSomeStuff())(TargetComp)
 *
 * // Get data on first render
 * <Comp id={1} />
 *
 * // Updates because we changed `id` prop
 * <Comp id={2} />
 *
 * // Nothing changed
 * <Comp id={2} />
 */

type ShouldDataUpdateFn = (prev: Props, next: Props) => boolean

/**
 * Merge parent props with `withData` internal state.
 *
 * By default:
 *
 * ```js
 * const defaultMergeProps = ({ dataStore, ...props }, state) => ({
 *   ..props,
 *   isLoading: props.isLoading || state.isLoading,
 *   error: state.error || props.error || null,
 *   ...(Array.isArray(state.data) ? { data: state.data } : state.data)
 * })
 * ```
 */

type MergePropsFn = (props: Props, state: State) => Props

type WrappedComponentType = {
  getData?: GetDataFn
} & $Subtype<ComponentType<any>>

type HOC = (WrappedComponentType) => ComponentType<any>

export type {
  ComponentType,
  ReactElement,
  GetDataFn,
  ShouldDataUpdateFn,
  MergePropsFn,
  DataStoreType,
  HOC,
  State,
  Props,
  WrappedComponentType
}
