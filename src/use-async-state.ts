import { useReducer, useMemo } from 'react'
import { AsyncState } from './types'

const INITIAL_STATE: AsyncState<null> = {
  isReady: null,
  isLoading: false,
  error: null,
  data: null,
}

type Action<T> =
  | { type: ActionTypes.START }
  | { type: ActionTypes.FINISH; payload: T | Error }

type Init<T> = (input: typeof INITIAL_STATE) => AsyncState<T>
type Reducer<T> = (prevState: AsyncState<T>, action: Action<T>) => AsyncState<T>

enum ActionTypes {
  START = 'START',
  FINISH = 'FINISH',
}

const init = <T>(input: Init<T> = null): AsyncState<T> => input(INITIAL_STATE)

const reducer: Reducer<any> = (prevState, action) => {
  switch (action.type) {
    case ActionTypes.START:
      return { ...prevState, isReady: false, isLoading: true, error: null }
    case ActionTypes.FINISH: {
      if (action.payload instanceof Error) {
        return {
          ...prevState,
          isReady: false,
          isLoading: false,
          error: action.payload,
        }
      }

      return {
        ...prevState,
        isReady: true,
        isLoading: false,
        data: action.payload,
        error: null,
      }
    }
    default:
      throw new Error('Unknown action type')
  }
}

export function useAsyncState<T>(initalState: Init<T>) {
  const [state, dispatch] = useReducer<Reducer<T>, Init<T>>(
    reducer,
    initalState,
    init
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
