import { useContext, useLayoutEffect } from 'react'
import { DataContext } from './context'
import { AsyncState, Key, Fetcher } from './types'
import { ActionTypes, useAsyncState } from './use-async-state'

export const used = new Set()

/**
 * Requests data and preserves the result to the state.
 * The `key` must be unique for the whole application.
 *
 * @see https://github.com/exah/react-universal-data#useFetchData
 */

export function useFetchData<T = any>(
  fetcher: Fetcher<T>,
  key: Key,
  ttl?: number
): AsyncState<T> {
  const store = useContext(DataContext)
  const [state, dispatch] = useAsyncState<T>(store.get(key))

  useLayoutEffect(() => {
    if (store.has(key)) {
      dispatch({ type: ActionTypes.FINISH, result: store.get(key) })

      if (ttl) {
        if (!store.hasTTL(key)) store.setTTL(key, ttl)
        return
      }

      if (!used.has(key)) {
        used.add(key)
        return
      }
    }

    let isCancelled = false
    function finish(result: T) {
      if (isCancelled) return

      dispatch({ type: ActionTypes.FINISH, result })

      if (!(result instanceof Error)) {
        store.setTTL(key, ttl)
        store.set(key, result)
      }
    }

    dispatch({ type: ActionTypes.START })

    Promise.resolve()
      .then(() => fetcher(key, { isServer: false }))
      .then(finish, finish)

    return () => {
      isCancelled = true
    }
  }, [store, key, ttl, dispatch, fetcher])

  return state
}
