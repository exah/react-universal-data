import { useContext, useEffect, useRef } from 'react'
import { IS_CLIENT, IS_SERVER } from './constants'
import { DataContext } from './context'
import { AsyncState, Key, Context, Fetcher, Store } from './types'
import { useAsyncState } from './use-async-state'

const CONTEXT: Context = {
  isServer: IS_SERVER,
  isClient: IS_CLIENT,
}

const READY_STATE: AsyncState<null> = {
  isReady: true,
  isLoading: false,
  error: null,
  data: null,
}

function init(key: Key, store: Store) {
  return (initialState: AsyncState<null>) => {
    const exists = store.exists(key)
    const data = store.getById(key)

    return exists ? { ...READY_STATE, data } : { ...initialState, data }
  }
}

function useServerData<T>(fetcher: Fetcher<T>, key: Key) {
  const store = useContext(DataContext)
  const [state] = useAsyncState<T>(init(key, store))

  if (store.exists(key)) {
    return state
  }

  const promise = Promise.resolve(fetcher(key, CONTEXT))
  promise.then((result) => store.save(key, result))

  throw promise
}

function useClientData<T>(fetcher: Fetcher<T>, key: Key, deps: any[] = []) {
  const firstRenderRef = useRef(true)
  const store = useContext(DataContext)
  const [state, actions] = useAsyncState<T>(init(key, store))

  useEffect(() => {
    if (store.exists(key) && firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }

    const promise = Promise.resolve(fetcher(key, CONTEXT))

    actions.start()
    promise.then(actions.finish, actions.finish)
  }, [store, actions, key, ...deps])

  return state
}

export const useUniversalData = IS_SERVER ? useServerData : useClientData
