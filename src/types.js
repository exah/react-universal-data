// @flow

import PropTypes from 'prop-types'

import type {
  ComponentType,
  Element as ReactElement
} from 'react'

type StateData = ? {} | Array<any>

type DataStoreType = {
  init: (value?: Object) => void,
  save: (id: number, value: StateData) => void,
  nextId: () => number,
  getById: (id: number) => StateData,
  get: () => Object
}

const dataStoreShapePropType = PropTypes.shape({
  init: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  nextId: PropTypes.func.isRequired,
  getById: PropTypes.func.isRequired,
  get: PropTypes.func.isRequired
})

type State = {
  isLoading: boolean,
  error: Error | null,
  data: StateData
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

type GetDataFn = (context: Object, prevData: Object) => Promise<{} | Array<any> | boolean | null>

/**
 * Function that checks if new data should be requested with `GetDataFn` when receiving new props.
 *
 * By default it compares [React Router](https://reacttraining.com/react-router) [`match.params`](https://reacttraining.com/react-router/web/api/match), [`location.pathname`](https://reacttraining.com/react-router/web/api/location), `location.search` props. Also you can change `id` prop on component to indicate update.
 *
 * ```js
 * const defaultShouldDataUpdate = (prevProps, nextProps) => {
 *   if (prevProps.match && prevProps.location) {
 *     return !(
 *       shallowEqual(prevProps.match.params, nextProps.match.params) &&
 *       prevProps.location.pathname === nextProps.location.pathname &&
 *       prevProps.location.search === nextProps.location.search
 *     )
 *   }
 *
 *   return prevProps.id !== nextProps.id
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
 *
 * @example
 *
 * // Do not restore data after rendering component previously unmounted
 * withData(
 *   () => api.getSomeStuff(),
 *   (prev, next, isUnmounted) => isUnmounted
 * )
 */

type ShouldDataUpdateFn = (prev: Props, next: Props, isUnmounted: boolean) => boolean

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

export {
  dataStoreShapePropType
}

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
