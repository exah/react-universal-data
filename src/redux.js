import React from 'react'
import PropTypes from 'prop-types'
import { createStore as createReduxStore } from 'redux'
import { Provider as ReduxProvider, connect } from 'react-redux'
import { compose } from 'recompose'
import { IS_SERVER } from './constants'
import { DataProvider } from './context'
import { createDataStore } from './data-store'
import { withData as originalWithDta } from './with-data'
import { getInitialData as originalGetInitialData } from './get-initial-data'

const defaultGetData = () => Promise.resolve()

const defaultMergeProps = (props, state) => ({
  ...props,
  isSSR: IS_SERVER || (state.data && state.data.isSSR === true),
  isLoading: props.isLoading || state.isLoading,
  error: state.error || props.error || null
})

const withData = (
  getData = defaultGetData,
  shouldDataUpdate,
  mergeProps = defaultMergeProps
) => originalWithDta(
  (props, prevData) => getData(props, prevData).then((data) => IS_SERVER ? {
    isSSR: true
  } : {}),
  shouldDataUpdate,
  mergeProps
)

const connectWithData = (
  mapStateToProps,
  mapDispatchToProps,
  getData,
  shouldDataUpdate,
  mergeProps
) => compose(
  connect(mapStateToProps, mapDispatchToProps),
  withData(getData, shouldDataUpdate, mergeProps)
)

const createStore = (reducer, preloadedState = [], enhancer) => {
  const [ reduxState, initialData ] = preloadedState
  const dataStore = createDataStore(initialData)
  const reduxStore = createReduxStore(reducer, reduxState, enhancer)

  return Object.assign(reduxStore, { dataStore })
}

const Provider = ({ store, children }) => (
  <ReduxProvider store={store}>
    <DataProvider value={store.dataStore}>
      {children}
    </DataProvider>
  </ReduxProvider>
)

Provider.propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
    dataStore: PropTypes.object.isRequired
  }),
  children: PropTypes.node
}

const getInitialData = (rootElement, serverContext, store) =>
  originalGetInitialData(rootElement, serverContext, store.dataStore)
    .then((initialData) => [ store.getState(), initialData ])

export {
  withData,
  connectWithData,
  getInitialData,
  createStore,
  Provider
}
