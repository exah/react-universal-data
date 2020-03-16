export type Key = number | string
export type Data = Record<Key, any>

export type Store<D extends Data = Data> = {
  init: (data?: D) => void
  save: (id: keyof D, value: D[typeof id]) => void
  getById: (id: keyof D) => D[typeof id]
  get: () => D
  exists: (id: keyof D) => boolean
  remove: (id: keyof D) => boolean
  nextId: () => number
  isInitial: () => boolean
  resetIds: () => void
}

export type AsyncState<T> =
  // initial
  | { isReady: null; isLoading: false; error: null; result: null }
  // ready
  | { isReady: true; isLoading: false; error: null; result: T }
  // loading
  | { isReady: boolean; isLoading: true; error: Error | null; result: T | null }
  // error
  | { isReady: false; isLoading: false; error: Error; result: T | null }

export type Context = { isServer: boolean; isClient: boolean }
export type Fetcher<T> = (key: Key, context: Context) => Promise<T>
