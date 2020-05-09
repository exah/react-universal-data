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

const merge = <A, B>(a: A, b: B) => Object.assign({}, a, b)

export const finished = <T>(next: T | Error, prev?: T): AsyncState<T> => {
  if (next instanceof Error) {
    return merge(INITIAL_STATE, { isReady: false, error: next, result: prev })
  }

  return merge(INITIAL_STATE, { isReady: true, result: next })
}

export const useAsyncState = <T>(input?: AsyncState<T>) =>
  useReducer((state: AsyncState<T>, action: Action<T>): AsyncState<T> => {
    switch (action.type) {
      case ActionTypes.START: {
        return merge(state, { isLoading: true, error: null })
      }
      case ActionTypes.FINISH: {
        return finished(action.result, state.result)
      }
    }
  }, input || INITIAL_STATE)
