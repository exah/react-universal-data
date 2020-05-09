import { useContext, useLayoutEffect } from 'react'
import { DataContext } from './context'
import { AsyncState, Key, Fetcher } from './types'
import { ActionTypes, useAsyncState, finished } from './use-async-state'

export const used = new Map()

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
  const init = store.has(key) ? finished<T>(store.get(key)) : null
  const [state, dispatch] = useAsyncState<T>(init)

  useLayoutEffect(() => {
    let isCancelled = false

    function cleanup() {
      isCancelled = true
      used.set(key, true)
    }

    function finish(result: T) {
      if (isCancelled) return

      dispatch({ type: ActionTypes.FINISH, result })

      if (!(result instanceof Error)) {
        store.setTTL(key, ttl)
        store.set(key, result)
      }
    }

    if ((ttl || !used.has(key)) && store.has(key)) {
      if (!store.hasTTL(key)) {
        store.setTTL(key, ttl)
      }

      return cleanup
    }

    dispatch({ type: ActionTypes.START })

    Promise.resolve()
      .then(() => fetcher(key, { isServer: false }))
      .then(finish, finish)

    return cleanup
  }, [store, key, ttl, dispatch, fetcher])

  return state
}
