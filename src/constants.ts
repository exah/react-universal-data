import { AsyncState } from './types'

export const IS_SERVER = typeof window === 'undefined'

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
