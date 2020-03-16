import { useContext, useLayoutEffect } from 'react'
import { IS_CLIENT, IS_SERVER } from './constants'
import { DataContext } from './context'
import { AsyncState, Key, Context, Fetcher, Store } from './types'
import { useAsyncState, INITIAL_STATE, FINISH_STATE } from './use-async-state'

const CONTEXT: Context = {
  isServer: IS_SERVER,
  isClient: IS_CLIENT,
}

function useServerData<T>(fetcher: Fetcher<T>, id: Key): AsyncState<T> {
  const store = useContext(DataContext)

  if (store.exists(id)) {
    const result: T = store.getById(id)
    return { ...FINISH_STATE, result }
  }

  const promise = Promise.resolve(fetcher(id, CONTEXT))
  promise.then((result) => store.save(id, result))

  throw promise
}

function init<T>(id: Key, store: Store): AsyncState<T> {
  return store.exists(id)
    ? { ...FINISH_STATE, result: store.getById(id) }
    : { ...INITIAL_STATE }
}

function useClientData<T>(fetcher: Fetcher<T>, id: Key): AsyncState<T> {
  const store = useContext(DataContext)
  const [state, actions] = useAsyncState<T>(init<T>(id, store))

  useLayoutEffect(() => {
    if (store.exists(id)) {
      store.remove(id)
      return
    }

    const promise = Promise.resolve(fetcher(id, CONTEXT))

    actions.start()
    promise.then(actions.finish).catch(actions.finish)
  }, [store, id, actions, fetcher])

  return state
}

export const useRUD = IS_SERVER ? useServerData : useClientData
