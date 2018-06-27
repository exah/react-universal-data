// @flow

import type { DataStoreType } from './types'

const createDataStore = (initialData?: Object): DataStoreType => {
  let store = initialData || {}
  let pointer = 0

  return {
    init: (value) => {
      pointer = 0
      store = value || {}
    },
    save: (id, value) => {
      store[id] = value
    },
    nextId: () => {
      pointer += 1
      return pointer
    },
    getById: (id) => id != null ? store[id] : null,
    get: () => store
  }
}

const defaultDataStore = createDataStore()
const rehydrateData = (data?: Object): void => defaultDataStore.init(data)

export {
  createDataStore,
  rehydrateData,
  defaultDataStore
}
