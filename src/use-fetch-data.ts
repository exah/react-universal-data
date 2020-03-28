import { useContext, useLayoutEffect } from 'react'
import { IS_SERVER, FINISH_STATE } from './constants'
import { DataContext } from './context'
import { AsyncState, Key, Context, Fetcher } from './types'
import { useAsyncState } from './use-async-state'

const CONTEXT: Context = { isServer: IS_SERVER }
const finished = <T>(result: T) => Object.assign({}, FINISH_STATE, { result })

function useFetchServerData<T>(fetcher: Fetcher<T>, id: Key): AsyncState<T> {
  const store = useContext(DataContext)

  if (store.has(id)) {
    return finished<T>(store.get(id))
  }

  throw Promise.resolve()
    .then(() => fetcher(id, CONTEXT))
    .then((result) => store.set(id, result))
}

function useFetchClientData<T>(fetcher: Fetcher<T>, id: Key): AsyncState<T> {
  const store = useContext(DataContext)
  const init = store.has(id) ? finished<T>(store.get(id)) : null
  const [state, actions] = useAsyncState<T>(init)

  useLayoutEffect(() => {
    if (store.has(id)) {
      store.delete(id)
      return
    }

    actions.start()
    Promise.resolve()
      .then(() => fetcher(id, CONTEXT))
      .then(actions.finish, actions.finish)
  }, [store, id, actions, fetcher])

  return state
}

export const useFetchData = IS_SERVER ? useFetchServerData : useFetchClientData
