// @flow

import type { DataStoreType } from './types'
import { INITIAL_ID } from './constants'

const createDataStore = (initialData?: Object): DataStoreType => {
  let store = initialData || {}
  let pointer = INITIAL_ID

  return {
    init: (value) => {
      pointer = INITIAL_ID
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
