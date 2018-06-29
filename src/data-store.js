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

/**
 * **Client**: Hydrates SSR state from `getAppInitialData`.
 * Must be used before rendering App root component.
 *
 * @example
 *
 * import React from 'react'
 * import ReactDOM from 'react-dom'
 * import { hydrateData } from 'react-get-app-data'
 * import HomePage from './pages/home'
 *
 * // Get server state
 * const { initialData } = (window._ssr || {})
 *
 * // Restore app state
 * hydrateData(initialData)
 *
 * // Render app
 * ReactDOM.hydrate((
 *   <HomePage />
 * ), document.getElementById('app'))
 *
 */

const hydrateData = (data?: Object): void => defaultDataStore.init(data)

export {
  createDataStore,
  hydrateData,
  defaultDataStore
}
