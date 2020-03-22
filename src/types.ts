export type Key = number | string
export type RawData = [Key, any][]

export type AsyncState<T> =
  // initial
  | { isReady: false; isLoading: false; error: null; result: null }
  // ready
  | { isReady: true; isLoading: false; error: null; result: T }
  // loading
  | { isReady: boolean; isLoading: true; error: Error | null; result: T | null }
  // error
  | { isReady: false; isLoading: false; error: Error; result: T | null }

export type Context = { isServer: boolean; isClient: boolean }
export type Fetcher<T> = (key: Key, context: Context) => Promise<T>
