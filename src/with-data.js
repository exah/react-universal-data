// @flow

import type {
  GetDataFn,
  ShouldDataUpdateFn,
  MergePropsFn,
  DataStoreType,
  WrappedComponentType,
  HOC
} from './types'

import {
  dataStoreShapePropType
} from './types'

import React, { PureComponent } from 'react'
import { DataConsumer } from './context'
import { defaultDataStore } from './data-store'

import {
  IS_CLIENT,
  IS_SERVER,
  INITIAL_ID
} from './constants'

const defaultGetData: GetDataFn = () => Promise.resolve(null)

const defaultShouldDataUpdate: ShouldDataUpdateFn = (prev, next) => {
  if (prev.match && prev.location) {
    return !(
      prev.match.params === next.match.params &&
      prev.location.pathname === next.location.pathname &&
      prev.location.search === next.location.search
    )
  }

  return prev.id !== next.id
}

const defaultMergeProps: MergePropsFn = ({ dataStore, ...props }, state) => ({
  ...props,
  isLoading: props.isLoading || state.isLoading,
  error: state.error || props.error || null,
  ...(Array.isArray(state.data) ? { data: state.data } : state.data)
})

/**
 * Higher-Order Component for getting async data for initial component props and in subsequent updates.
 *
 * #### Props
 *
 * - Anything required for your {@link GetDataFn} or custom {@link ShouldDataUpdateFn}
 *
 * #### Provided props
 *
 * - `...props` — All props passed to `withData` from parent
 * - `isLoading: boolean` — Status of `getData` promise (server: `false`)
 * - `error: Error | null` — Error rejected with promise (server: `null`) <br>
 *   On server you may want to return custom `{ error }` inside `Promise.catch` to show errors inside component. Otherwise component will try to request data again on client after mount.
 * - `...result` — Everything returned in `getData` will be passed as props
 *
 * See {@link GetDataFn} and {@link MergePropsFn}.
 *
 * @param getData — Function that returns promise with props for wrapped component
 *
 * @return — [Higher-Order Component](https://reactjs.org/docs/higher-order-components.html)
 *
 * @example
 *
 * const Comp = withData(getData?, shouldDataUpdate?, mergeProps?)(TargetComp)
 *
 *
 * @example
 *
 * import { withData } from 'react-universal-data'
 *
 * const Page = ({ message }) => (
 *   <div>
 *     {message}
 *   </div>
 * )
 *
 * export default withData((contextAndProps, prevData) =>
 *   Promise.resolve({ message: 'ok' })
 * )(Page)
 *
 * @example
 *
 * import React from 'react'
 * import { withData } from 'react-universal-data'
 *
 * class Page extends React.Component {
 *   // Same as `withData` first argument
 *   static async getData (contextAndProps, prevData) {
 *     return {
 *       name: 'John'
 *     }
 *   }
 *   render () {
 *     return (
 *       <div>
 *         Hello {this.props.name}!
 *       </div>
 *     )
 *   }
 * }
 *
 * export default withData()(Page)
 */

const withData = (
  getData: GetDataFn = defaultGetData,
  shouldDataUpdate: ShouldDataUpdateFn = defaultShouldDataUpdate,
  mergeProps: MergePropsFn = defaultMergeProps
): HOC => (WrappedComponent: WrappedComponentType) => {
  let dataId = INITIAL_ID
  let savedProps = null

  const methods = {
    getData: WrappedComponent.getData || getData,
    shouldDataUpdate: WrappedComponent.shouldDataUpdate || shouldDataUpdate,
    mergeProps: WrappedComponent.mergeDataWithProps || mergeProps
  }

  const getDataHandler = (props, prevData, serverContext) => {
    const promise = methods.getData({
      isClient: IS_CLIENT,
      isServer: IS_SERVER,
      ...serverContext,
      ...props
    }, prevData)

    promise.then((data) => {
      if (data) {
        props.dataStore.save(dataId, data)
      }
    })

    return promise
  }

  class Data extends PureComponent<any, any> {
    isRequestCancelled: boolean
    static displayName = `withData(${WrappedComponent.displayName || WrappedComponent.name || 'Component'}`
    static defaultProps = {
      dataStore: defaultDataStore
    }
    static propTypes = {
      dataStore: dataStoreShapePropType
    }
    constructor (props) {
      super(props)

      if (dataId === INITIAL_ID || props.dataStore.isInitial()) {
        dataId = props.dataStore.nextId()
      } else if (
        savedProps === null ||
        methods.shouldDataUpdate(savedProps, props, true)
      ) {
        props.dataStore.save(dataId, null)
      }

      this.state = {
        isLoading: false,
        error: null,
        data: props.dataStore.getById(dataId)
      }

      savedProps = { ...props }
    }
    handleRequest = (requestPromise) => {
      this.isRequestCancelled = false
      this.setState({ isLoading: true })

      requestPromise
        .then((data) => data ? { data } : null)
        .catch((error) => ({ error }))
        .then((nextState) => {
          if (this.isRequestCancelled === false) {
            this.setState({
              ...nextState,
              isLoading: false
            })
          }
        })

      return requestPromise
    }
    getInitialData = (serverContext) => getDataHandler(
      this.props,
      this.state.data,
      serverContext
    )
    getData = () => this.handleRequest(
      getDataHandler(
        this.props,
        this.state.data
      )
    )
    componentDidMount () {
      if (this.state.data == null) {
        this.getData()
      }
    }
    componentDidUpdate (prevProps) {
      if (methods.shouldDataUpdate(prevProps, this.props, false)) {
        savedProps = { ...this.props }
        this.getData()
      }
    }
    componentWillUnmount () {
      this.isRequestCancelled = true
    }
    render () {
      return (
        <WrappedComponent {...methods.mergeProps(this.props, this.state)} />
      )
    }
  }

  return (props: Object) => (
    <DataConsumer>
      {(dataStore: DataStoreType) => <Data {...props} dataStore={dataStore} />}
    </DataConsumer>
  )
}

export {
  withData
}
