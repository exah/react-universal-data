import { createElement, useContext, useRef, useEffect } from 'react'
import { AsyncState, Fetcher, Merge } from './types'
import { DataContext } from './context'

import { INITIAL_ID } from './constants'
import { useRUD } from './use-rud'

const defaultShouldUpdate = () => false
const defaultMergeProps = <D, P>(
  props: P,
  state: AsyncState<D>
): Merge<P, D> => ({
  ...props,
  ...state.result,
  isReady: state.isReady,
  isLoading: state.isLoading,
  error: state.error,
})

function usePrevious<T>(value: T) {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export const withRUD = <D = any, P = any>(
  fetcher: Fetcher<D>,
  shouldUpdate: (prev: P, next: P) => boolean = defaultShouldUpdate,
  mergeProps = defaultMergeProps
) => (Comp: React.ComponentType<Merge<P, D>>) => {
  const name = Comp.displayName || Comp.name || 'Component'

  let id = INITIAL_ID
  function DataComp(props: P) {
    const store = useContext(DataContext)
    const prevProps = usePrevious(props)

    if (id === INITIAL_ID || shouldUpdate(prevProps, props)) {
      id = store.nextId()
    }

    const state = useRUD(fetcher, id)
    return createElement(Comp, mergeProps<D, P>(props, state))
  }

  DataComp.displayName = `withRUD(${name})`
  return DataComp
}
