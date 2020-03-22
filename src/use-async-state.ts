import { useReducer, useMemo } from 'react'
import { AsyncState } from './types'
import { ActionTypes, INITIAL_STATE, FINISH_STATE } from './constants'

type Action<T> =
  | { type: ActionTypes.START }
  | { type: ActionTypes.FINISH; payload: T | Error }

type Reducer<T> = (prevState: AsyncState<T>, action: Action<T>) => AsyncState<T>

const merge = <A, B>(a: A, b: B) => Object.assign({}, a, b)

const reducer: Reducer<any> = (prevState, action) => {
  switch (action.type) {
    case ActionTypes.START:
      return merge(prevState, { isLoading: true, error: null })
    case ActionTypes.FINISH: {
      if (action.payload instanceof Error) {
        return merge(FINISH_STATE, { isReady: false, error: action.payload })
      }

      return merge(FINISH_STATE, { result: action.payload })
    }
    default:
      throw new Error('Unknown action type')
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
