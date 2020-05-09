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

export const init = <T>(value?: T | Error, prev?: T): AsyncState<T> => {
  if (value instanceof Error) {
    return merge(INITIAL_STATE, { isReady: false, error: value, result: prev })
  }

  return merge(INITIAL_STATE, { isReady: value !== undefined, result: value })
}

export const useAsyncState = <T>(input?: T) =>
  useReducer(
    (state: AsyncState<T>, action: Action<T>): AsyncState<T> => {
      switch (action.type) {
        case ActionTypes.START: {
          return merge(state, { isLoading: true, error: null })
        }
        case ActionTypes.FINISH: {
          return init(action.result, state.result)
        }
      }
    },
    input,
    init
  )
