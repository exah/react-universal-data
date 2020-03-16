import { createElement, useContext } from 'react'
import { AsyncState, Fetcher } from './types'
import { DataContext } from './context'

import { INITIAL_ID } from './constants'
import { useRUD } from './use-rud'

type Merge<P, D> = P &
  D &
  Pick<AsyncState<D>, 'isReady' | 'isLoading' | 'error'>

type BaseComponent<D, P> = React.ComponentType<Merge<P, D>> & {
  getInitialProps?: Fetcher<D>
}

const defaultMerge = <D, P>(props: P, state: AsyncState<D>): Merge<P, D> => ({
  ...props,
  ...state.result,
  isReady: state.isReady,
  isLoading: state.isLoading,
  error: state.error,
})

export function withGetInitialProps<D = any, P = any>(
  BaseComp: BaseComponent<D, P>,
  fetcher: Fetcher<D> = BaseComp.getInitialProps,
  merge = defaultMerge
) {
  const name = BaseComp.displayName || BaseComp.name || 'Component'

  let id = INITIAL_ID
  function DataComp(props: P) {
    const store = useContext(DataContext)

    if (id === INITIAL_ID) {
      id = store.nextId()
    }

    const state = useRUD(fetcher, id)
    return createElement(BaseComp, merge<D, P>(props, state))
  }

  DataComp.displayName = `withData(${name})`
  return DataComp
}
