import { useReducer } from 'react'
import { AsyncState } from './types'

export const enum ActionTypes {
  START,
  FINISH,
}

const INITIAL_STATE: AsyncState<undefined> = {
  isReady: false,
  isLoading: false,
  error: null,
  result: undefined,
}

type Action<T> =
  | { type: ActionTypes.START }
  | { type: ActionTypes.FINISH; result: T | Error }

type Reducer<T> = (state: AsyncState<T>, action: Action<T>) => AsyncState<T>

const merge = <A, B>(a: A, b: B) => Object.assign({}, a, b)

export const finished = <T>(next: T | Error, prev?: T): AsyncState<T> => {
  if (next instanceof Error) {
    return merge(INITIAL_STATE, { isReady: false, error: next, result: prev })
  }

  return merge(INITIAL_STATE, { isReady: true, result: next })
}

const reducer: Reducer<any> = (state, action) => {
  switch (action.type) {
    case ActionTypes.START: {
      return merge(state, { isLoading: true, error: null })
    }
    case ActionTypes.FINISH: {
      return finished(action.result, state.result)
    }
  }
}

export function useAsyncState<T>(input: AsyncState<T>) {
  return useReducer<Reducer<T>>(reducer, merge(INITIAL_STATE, input))
}
