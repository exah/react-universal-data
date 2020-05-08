import { useContext } from 'react'
import { DataContext } from './context'
import { AsyncState, Key, Fetcher } from './types'
import { finished } from './use-async-state'

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

  if (store.has(key)) {
    return finished<T>(store.get(key))
  }

  throw Promise.resolve()
    .then(() => fetcher(key, { isServer: true }))
    .then((result) => {
      store.set(key, result)
      store.setTTL(key, ttl)
    })
}
