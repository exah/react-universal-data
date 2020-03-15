import { Data, Store } from './types'
import { INITIAL_ID } from './constants'

export function createDataStore<T>(initial: T): Store<T> {
  let store = initial
  let pointer = INITIAL_ID

  return {
    init: (value) => {
      pointer = INITIAL_ID
      store = value
    },
    save: (id, value) => {
      store[id] = value
    },
    nextId: () => {
      pointer += 1
      return pointer
    },
    exists: (id) => store[id] !== undefined,
    getById: (id) => (id != null ? store[id] : null),
    get: () => store,
    resetIds: () => {
      pointer = INITIAL_ID
      return pointer
    },
    isInitial: () => pointer === INITIAL_ID,
  }
}

export const defaultDataStore = createDataStore<Data>({})
export const hydrateData = (data: Data) => defaultDataStore.init(data)
