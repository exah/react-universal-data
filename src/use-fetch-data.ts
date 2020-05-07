import { useContext, useLayoutEffect } from 'react'
import { IS_SERVER } from './constants'
import { DataContext } from './context'
import { AsyncState, Key, Context, Fetcher } from './types'
import { useAsyncState, finished } from './use-async-state'

const CONTEXT: Context = { isServer: IS_SERVER }

/**
 * Requests data and preserves the result to the state.
 * The `key` must be unique for the whole application.
 *
 * @see https://github.com/exah/react-universal-data#useFetchData
 */

function useFetchServerData<T = any>(
  fetcher: Fetcher<T>,
  key: Key,
  ttl?: number
): AsyncState<T> {
  const store = useContext(DataContext)

  if (store.has(key)) {
    return finished<T>(store.get(key))
  }

  throw Promise.resolve()
    .then(() => fetcher(key, CONTEXT))
    .then((result) => store.set(key, result, ttl))
}

function useFetchClientData<T = any>(
  fetcher: Fetcher<T>,
  key: Key,
  ttl?: number
): AsyncState<T> {
  const store = useContext(DataContext)
  const init = store.has(key) ? finished<T>(store.get(key)) : null
  const [state, actions] = useAsyncState<T>(init)

  useLayoutEffect(() => {
    if (store.has(key)) {
      if (!ttl) store.delete(key)

      return
    }

    let isCancelled = false
    function finish(result: T) {
      if (isCancelled) return

      actions.finish(result)

      if (!(result instanceof Error)) {
        store.set(key, result, ttl)
      }
    }

    function cleanup() {
      isCancelled = true
    }

    actions.start()
    Promise.resolve()
      .then(() => fetcher(key, CONTEXT))
      .then(finish, finish)

    return cleanup
  }, [store, key, actions, fetcher])

  return state
}

export const useFetchData = IS_SERVER ? useFetchServerData : useFetchClientData
