import { useContext, useLayoutEffect } from 'react'
import { IS_CLIENT, IS_SERVER } from './constants'
import { DataContext } from './context'
import { AsyncState, Key, Context, Fetcher, Store } from './types'
import { useAsyncState, INITIAL_STATE, READY_STATE } from './use-async-state'

const CONTEXT: Context = {
  isServer: IS_SERVER,
  isClient: IS_CLIENT,
}

function useServerData<T>(fetcher: Fetcher<T>, key: Key): AsyncState<T> {
  const store = useContext(DataContext)

  if (store.exists(key)) {
    const result: T = store.getById(key)
    return { ...READY_STATE, result }
  }

  const promise = Promise.resolve(fetcher(key, CONTEXT))
  promise.then((result) => store.save(key, result))

  throw promise
}

function init<T>(key: Key, store: Store): AsyncState<T> {
  return store.exists(key)
    ? { ...READY_STATE, result: store.getById(key) }
    : { ...INITIAL_STATE }
}

function useClientData<T>(fetcher: Fetcher<T>, key: Key): AsyncState<T> {
  const store = useContext(DataContext)
  const [state, actions] = useAsyncState<T>(init<T>(key, store))

  useLayoutEffect(() => {
    if (store.exists(key)) {
      store.remove(key)
      return
    }

    const promise = Promise.resolve(fetcher(key, CONTEXT))

    actions.start()
    promise.then(actions.finish).catch(actions.finish)
  }, [store, key, actions, fetcher])

  return state
}

export const useRUD = IS_SERVER ? useServerData : useClientData
