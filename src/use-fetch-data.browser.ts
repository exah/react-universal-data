import { useContext, useLayoutEffect } from 'react'
import { DataContext } from './context'
import { AsyncState, Key, Fetcher } from './types'
import { useAsyncState, finished } from './use-async-state'

const used = new Map()

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
    let isCancelled = false

    function cleanup() {
      isCancelled = true
      used.set(key, true)
    }

    function finish(result: T) {
      if (isCancelled) return

      actions.finish(result)

      if (!(result instanceof Error)) {
        store.setTTL(key, ttl)
        store.set(key, result)
      }
    }

    if (store.has(key) && !used.has(key)) {
      if (ttl && !store.hasTTL(key)) {
        store.setTTL(key, ttl)
      }

      return cleanup
    }

    actions.start()
    Promise.resolve()
      .then(() => fetcher(key, { isServer: false }))
      .then(finish, finish)

    return cleanup
  }, [store, key, ttl, actions, fetcher])

  return state
}
