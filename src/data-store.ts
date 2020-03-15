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
    resetIds: () => {
      pointer = INITIAL_ID
      return pointer
    },
    exists: (id) => store[id] !== undefined,
    remove: (id) => delete store[id],
    getById: (id) => (id != null ? store[id] : null),
    isInitial: () => Object.keys(store).length === 0,
    get: () => store,
  }
}

export const defaultDataStore = createDataStore<Data>({})
export const hydrateData = (data: Data) => defaultDataStore.init(data)
