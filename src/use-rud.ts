import { useContext, useLayoutEffect } from 'react'
import { IS_CLIENT, IS_SERVER, FINISH_STATE } from './constants'
import { DataContext } from './context'
import { AsyncState, Key, Context, Fetcher } from './types'
import { useAsyncState } from './use-async-state'

const CONTEXT: Context = { isServer: IS_SERVER, isClient: IS_CLIENT }
const finished = <T>(result: T) => Object.assign({}, FINISH_STATE, { result })

function useServerData<T>(fetcher: Fetcher<T>, id: Key): AsyncState<T> {
  const store = useContext(DataContext)

  if (store.has(id)) {
    return finished<T>(store.get(id))
  }

  const promise = Promise.resolve(fetcher(id, CONTEXT))
  promise.then((result) => store.set(id, result))

  throw promise
}

function useClientData<T>(fetcher: Fetcher<T>, id: Key): AsyncState<T> {
  const store = useContext(DataContext)
  const init = store.has(id) ? finished<T>(store.get(id)) : null
  const [state, actions] = useAsyncState<T>(init)

  useLayoutEffect(() => {
    if (store.has(id)) {
      store.delete(id)
      return
    }

    const promise = Promise.resolve(fetcher(id, CONTEXT))

    actions.start()
    promise.then(actions.finish).catch(actions.finish)
  }, [store, id, actions, fetcher])

  return state
}

export const useRUD = IS_SERVER ? useServerData : useClientData
