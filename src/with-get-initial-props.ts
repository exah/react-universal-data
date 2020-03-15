import { createElement, useContext } from 'react'
import { AsyncState, Fetcher } from './types'
import { DataContext } from './context'

import { INITIAL_ID } from './constants'
import { useUniversalData } from './use-univeral-data'

type Merge<P, D> = P &
  D &
  Pick<AsyncState<D>, 'isReady' | 'isLoading' | 'error'>

type BaseComponent<D, P> = React.ComponentType<Merge<P, D>> & {
  getInitialProps: Fetcher<D>
}

const merge = <D, P>(props: P, state: AsyncState<D>): Merge<P, D> => ({
  ...props,
  ...state.data,
  isReady: state.isReady,
  isLoading: state.isLoading,
  error: state.error,
})

export function withGetInitialProps<D = any, P = any>(
  BaseComp: BaseComponent<D, P>
) {
  const name = BaseComp.displayName || BaseComp.name || 'Component'

  let dataId = INITIAL_ID
  function DataComp(props: P) {
    const store = useContext(DataContext)

    if (dataId === INITIAL_ID) {
      dataId = store.nextId()
    }

    const state = useUniversalData(BaseComp.getInitialProps, dataId)

    return createElement(BaseComp, merge<D, P>(props, state))
  }

  DataComp.displayName = `withData(${name})`
  return DataComp
}
