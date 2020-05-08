import { useReducer, useMemo } from 'react'
import { AsyncState } from './types'

const enum ActionTypes {
  START,
  FINISH,
}

const INITIAL_STATE: AsyncState<undefined> = {
  isReady: false,
  isLoading: false,
  error: null,
  result: undefined,
}

const FINISH_STATE: AsyncState<undefined> = {
  isReady: true,
  isLoading: false,
  error: null,
  result: undefined,
}

type Action<T> =
  | { type: ActionTypes.START }
  | { type: ActionTypes.FINISH; payload: T | Error }

type Reducer<T> = (state: AsyncState<T>, action: Action<T>) => AsyncState<T>

const merge = <A, B>(a: A, b: B) => Object.assign({}, a, b)

export const finished = <T>(value: T | Error, result?: T): AsyncState<T> => {
  if (value instanceof Error) {
    return merge(FINISH_STATE, { isReady: false, error: value, result })
  }

  return merge(FINISH_STATE, { result: value })
}

export const reducer: Reducer<any> = (state, action) => {
  switch (action.type) {
    case ActionTypes.START: {
      return merge(state, { isLoading: true, error: null })
    }
    case ActionTypes.FINISH: {
      return finished(action.payload, state.result)
    }
    default: {
      throw new Error('Unknown action type')
    }
  }
}

export function useAsyncState<T>(input: AsyncState<T>) {
  const [state, dispatch] = useReducer<Reducer<T>>(
    reducer,
    merge(INITIAL_STATE, input)
  )

  const actions = useMemo(() => {
    const start = () => {
      dispatch({ type: ActionTypes.START })
    }

    const finish = (payload: T) => {
      dispatch({ type: ActionTypes.FINISH, payload })
    }

    return { start, finish }
  }, [dispatch])

  return [state, actions] as const
}
