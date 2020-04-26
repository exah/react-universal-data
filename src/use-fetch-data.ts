import { useContext, useLayoutEffect } from 'react'
import { IS_SERVER, FINISH_STATE } from './constants'
import { DataContext } from './context'
import { AsyncState, Key, Context, Fetcher } from './types'
import { useAsyncState } from './use-async-state'

const CONTEXT: Context = { isServer: IS_SERVER }
const finished = <T>(result: T) => Object.assign({}, FINISH_STATE, { result })

/**
 * Requests data and preserves the result to the state.
 * The `id` must be unique for the whole application.
 *
 * @see https://github.com/exah/react-universal-data#useFetchData
 */

function useFetchServerData<T = any>(
  fetcher: Fetcher<T>,
  id: Key
): AsyncState<T> {
  const store = useContext(DataContext)

  if (store.has(id)) {
    return finished<T>(store.get(id))
  }

  throw Promise.resolve()
    .then(() => fetcher(id, CONTEXT))
    .then((result) => store.set(id, result))
}

function useFetchClientData<T = any>(
  fetcher: Fetcher<T>,
  id: Key
): AsyncState<T> {
  const store = useContext(DataContext)
  const init = store.has(id) ? finished<T>(store.get(id)) : null
  const [state, actions] = useAsyncState<T>(init)

  useLayoutEffect(() => {
    if (store.has(id)) {
      store.delete(id)
      return
    }

    let isCancelled = false
    function finish(result: T) {
      if (!isCancelled) actions.finish(result)
    }

    function cleanup() {
      isCancelled = true
    }

    actions.start()
    Promise.resolve()
      .then(() => fetcher(id, CONTEXT))
      .then(finish, finish)

    return cleanup
  }, [store, id, actions, fetcher])

  return state
}

export const useFetchData = IS_SERVER ? useFetchServerData : useFetchClientData
