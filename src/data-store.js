// @flow

import type { DataStoreType } from './types'
import { INITIAL_ID } from './constants'

/**
 * Create custom `dataStore`, that can be provided to {@link DataProvider} and {@link getInitialData}.
 *
 * @example
 * // client.js
 *
 * import React from 'react'
 * import ReactDOM from 'react-dom'
 * import { createDataStore, DataProvider } from 'react-get-app-data'
 * import App from './app'
 *
 * const { initialData } = (window._ssr || {})
 *
 * const myDataStore = createDataStore(intialData)
 *
 * ReactDOM.render((
 *   <DataProvider value={myDataStore}>
 *     <App />
 *   </DataProvider>
 * ), document.getElementById('app'))
 *
 *
 * @example
 * // server.js
 *
 * import { html } from 'common-tags'
 * import React from 'react'
 * import { renderToString } from 'react-dom/server'
 * import { getInitialData, createDataStore, DataProvider } from 'react-get-app-data'
 * import App from './app'
 *
 * export default () => (req, res) => {
 *   const myDataStore = createDataStore()

 *   const appElement = (
 *     <DataProvider value={myDataStore}>
 *       <App />
 *     </DataProvider>
 *   )
 *
 *   getInitialData(appElement, { req, res }, myDataStore)
 *     .then((initialData) => {
 *       res.send(html`
 *         <!DOCTYPE html>
 *         <html>
 *           <body>
 *             <div id="app">${renderToString(appElement)}</div>
 *             <script>
 *               (function () {
 *                 window._ssr = ${JSON.stringify({ initialData })};
 *               })();
 *             </script>
 *             <script src="/client.js"></script>
 *           </body>
 *         </html>
 *       `)
 *     })
 *     .catch() // Somehow handle errors
 * }
 */

const createDataStore = (initialData?: Object = {}): DataStoreType => {
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
 * **Client**: Hydrates SSR state from `getInitialData`.
 * Must be used before rendering App root component.
 *
 * @example
 *
 * import React from 'react'
 * import ReactDOM from 'react-dom'
 * import { hydrateData } from 'react-get-app-data'
 * import App from './app'
 *
 * // Get server state
 * const { initialData } = (window._ssr || {})
 *
 * // Restore app state
 * hydrateData(initialData)
 *
 * // Render app
 * ReactDOM.hydrate((
 *   <App />
 * ), document.getElementById('app'))
 *
 */

const hydrateData = (data?: Object): void => defaultDataStore.init(data)

export {
  createDataStore,
  hydrateData,
  defaultDataStore
}
