import { useReducer, useMemo } from 'react'
import { AsyncState } from './types'

export const INITIAL_STATE: AsyncState<null> = {
  isReady: null,
  isLoading: false,
  error: null,
  result: null,
}

export const READY_STATE: AsyncState<null> = {
  isReady: true,
  isLoading: false,
  error: null,
  result: null,
}

type Action<T> =
  | { type: ActionTypes.START }
  | { type: ActionTypes.FINISH; payload: T | Error }

type Reducer<T> = (prevState: AsyncState<T>, action: Action<T>) => AsyncState<T>

enum ActionTypes {
  START = 'START',
  FINISH = 'FINISH',
}

const reducer: Reducer<any> = (prevState, action) => {
  switch (action.type) {
    case ActionTypes.START:
      return {
        ...prevState,
        isLoading: true,
        error: null,
      }
    case ActionTypes.FINISH: {
      if (action.payload instanceof Error) {
        return {
          ...prevState,
          ...READY_STATE,
          isReady: false,
          error: action.payload,
        }
      }

      return {
        ...prevState,
        ...READY_STATE,
        result: action.payload,
      }
    }
    default:
      throw new Error('Unknown action type')
  }
}

export function useAsyncState<T>(initialState: AsyncState<T>) {
  const [state, dispatch] = useReducer<Reducer<T>>(reducer, {
    ...INITIAL_STATE,
    ...initialState,
  })

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
