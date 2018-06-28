// @flow

import type {
  GetDataFn,
  DataStoreType,
  WrappedComponentType,
  HOC,
  Props,
  State
} from './types'

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, wrapDisplayName } from 'recompose'
import { DataConsumer } from './context'
import { defaultDataStore } from './data-store'

import {
  IS_CLIENT,
  IS_SERVER,
  INITIAL_ID
} from './constants'

const defaultGetData: GetDataFn = () => Promise.resolve(false)

const defaultShouldDataUpdate = (prev, next): boolean => {
  if (prev.match && prev.location) {
    return !(
      shallowEqual(prev.match.params, next.match.params) &&
      prev.location.pathname === next.location.pathname &&
      prev.location.search === next.location.search
    )
  }

  return false
}

const defaultMergeProps = ({ dataStore, ...props }, state): Props => ({
  ...props,
  ...state.data,
  isLoading: props.isLoading || state.isLoading,
  error: state.error || props.error || null
})

/**
 * HOC for getting async data for initial component props and in subsequent updates.
 *
 * @example
 *
 * import { withData } from 'react-get-app-data'
 *
 * const Page = ({ message }) => (
 *   <div>
 *     {message}
 *   </div>
 * )
 *
 * export default withData(() =>
 *   Promise.resolve({ message: 'ok' })
 * )(Page)
 */

const withData = (
  getData: GetDataFn,
  shouldDataUpdate: (prev: Props, next: Props) => boolean = defaultShouldDataUpdate,
  mergeProps: (props: Props, state: State) => Props = defaultMergeProps
): HOC => (WrappedComponent: WrappedComponentType) => {
  let id = INITIAL_ID
  let unmountedProps = {}

  const getDataPromise = getData || WrappedComponent.getData || defaultGetData

  const getDataHandler = (context) => {
    const promise = getDataPromise({
      isClient: IS_CLIENT,
      isServer: IS_SERVER,
      ...context
    })

    promise.then((data) => context.dataStore.save(id, data))

    return promise
  }

  class Data extends PureComponent<any, any> {
    static displayName = wrapDisplayName(
      WrappedComponent,
      'withData'
    )
    static defaultProps = {
      dataStore: defaultDataStore
    }
    static propTypes = {
      dataStore: PropTypes.shape({
        save: PropTypes.func.isRequired,
        nextId: PropTypes.func.isRequired,
        getById: PropTypes.func.isRequired
      })
    }
    constructor (props) {
      super(props)

      if (id !== INITIAL_ID && shouldDataUpdate(unmountedProps, props)) {
        id = INITIAL_ID
      }

      if (!id) {
        id = props.dataStore.nextId()
      }

      this.state = {
        isLoading: false,
        error: null,
        data: props.dataStore.getById(id)
      }
    }
    getInitialData = (serverContext) => getDataHandler({
      ...serverContext,
      ...this.props
    })
    handleRequest = (promise) => {
      this.setState({ isLoading: true })

      promise
        .then((data) => this.setState({ isLoading: false, data }))
        .catch((error) => this.setState({ isLoading: false, error }))

      return promise
    }
    componentDidMount () {
      if (this.props.dataStore.getById(id) == null) {
        this.handleRequest(getDataHandler(this.props))
      }
    }
    componentDidUpdate (prevProps) {
      if (shouldDataUpdate(prevProps, this.props)) {
        this.handleRequest(getDataHandler(this.props))
      }
    }
    componentWillUnmount () {
      unmountedProps = this.props
    }
    render () {
      return (
        <WrappedComponent {...mergeProps(this.props, this.state)} />
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
