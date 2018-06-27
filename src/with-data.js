import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, wrapDisplayName } from 'recompose'
import { isClient, isServer } from './constants'
import { DataConsumer } from './context'
import { defaultDataStore } from './data-store'

const defaultGetData = () => Promise.resolve()

const defaultShouldDataUpdate = (prev, next) => {
  if (prev.match && prev.location) {
    return !(
      shallowEqual(prev.match.params, next.match.params) &&
      prev.location.pathname === next.location.pathname &&
      prev.location.search === next.location.search
    )
  }

  return false
}

const defaultMergeProps = ({ dataStore, ...ownProps }, stateProps) => ({
  ...ownProps,
  ...stateProps.data,
  isLoading: ownProps.isLoading || stateProps.isLoading,
  error: stateProps.error || ownProps.error || null
})

const withData = (
  userGetData,
  shouldDataUpdate = defaultShouldDataUpdate,
  mergeProps = defaultMergeProps
) => (BaseComponent) => {
  let id = null

  const optGetData = userGetData || BaseComponent.getData || defaultGetData
  const getData = (context) => {
    const promise = optGetData({ isClient, isServer, ...context })

    promise.then((data) => context.dataStore.save(id, data))

    return promise
  }

  class Data extends PureComponent {
    static displayName = wrapDisplayName(
      BaseComponent,
      'withData'
    )
    static defaultProps = {
      dataStore: defaultDataStore
    }
    static propTypes = {
      dataStore: PropTypes.shape({
        nextId: PropTypes.func.isRequired,
        getById: PropTypes.func.isRequired
      })
    }
    constructor (props) {
      super(props)

      if (!id) {
        id = props.dataStore.nextId()
      }

      this.state = {
        isLoading: false,
        error: null,
        data: props.dataStore.getById(id)
      }
    }
    getInitialData = (context) => getData({
      ...context,
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
        this.handleRequest(getData(this.props))
      }
    }
    componentDidUpdate (prevProps) {
      if (shouldDataUpdate(prevProps, this.props)) {
        this.handleRequest(getData(this.props))
      }
    }
    render () {
      return (
        <BaseComponent {...mergeProps(this.props, this.state)} />
      )
    }
  }

  return (props) => (
    <DataConsumer>
      {(dataStore) => <Data {...props} dataStore={dataStore} />}
    </DataConsumer>
  )
}

export {
  withData
}
