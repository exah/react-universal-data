import { AsyncState } from './types'

export const IS_CLIENT = typeof window !== 'undefined'
export const IS_SERVER = !IS_CLIENT

export const enum ActionTypes {
  START = 'START',
  FINISH = 'FINISH',
}

export const INITIAL_STATE: AsyncState<null> = {
  isReady: false,
  isLoading: false,
  error: null,
  result: undefined,
}

export const FINISH_STATE: AsyncState<null> = {
  isReady: true,
  isLoading: false,
  error: null,
  result: undefined,
}
