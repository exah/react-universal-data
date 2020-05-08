import { useContext, useLayoutEffect } from 'react'
import { DataContext } from './context'
import { AsyncState, Key, Fetcher } from './types'
import { useAsyncState, finished } from './use-async-state'

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
  const [state, actions] = useAsyncState<T>(init)

  useLayoutEffect(() => {
    if (store.has(key)) {
      if (!ttl) {
        store.delete(key)
      } else if (!store.hasTTL(key)) {
        store.setTTL(key, ttl)
      }

      return
    }

    let isCancelled = false
    function finish(result: T) {
      if (isCancelled) return

      actions.finish(result)

      if (!(result instanceof Error) && ttl) {
        store.setTTL(key, ttl)
        store.set(key, result)
      }
    }

    function cleanup() {
      isCancelled = true
    }

    actions.start()
    Promise.resolve()
      .then(() => fetcher(key, { isServer: false }))
      .then(finish, finish)

    return cleanup
  }, [store, key, ttl, actions, fetcher])

  return state
}
