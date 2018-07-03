// @flow

import type {
  ReactElement,
  DataStoreType
} from './types'

import reactTreeWalker from 'react-tree-walker'
import { defaultDataStore } from './data-store'

/**
 * **Server**: Request app data from all `withData` wrapped components
 * by walking deep inside React element [`tree`](https://github.com/ctrlplusb/react-tree-walker/).
 *
 * @param rootElement — Your app root React element
 * @param serverContext — Can be used to provide additional data to `GetDataFn` (like `req`, `res` from an `express` middleware).
 *
 * @example
 *
 * import React from 'react'
 * import { renderToString } from 'react-dom/server'
 * import { getAppInitialData } from 'react-get-app-data'
 * import { html } from 'common-tags'
 *
 * import App from './app'
 *
 * export default () => (req, res) => {
 *   const appElement = (<App />)
 *
 *   getAppInitialData(appElement, { req, res })
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
 *     .catch((error) => {
 *       console.error(error)
 *       res.status(500)
 *       res.send(`Error: ${error.message}`)
 *     })
 * }
 *
 */

const getAppInitialData = (
  rootElement: ReactElement<any>,
  serverContext: Object,
  dataStore: DataStoreType = defaultDataStore
): Promise<Object> => {
  dataStore.init()

  return new Promise((resolve, reject) =>
    reactTreeWalker(rootElement, (el, instance) => {
      if (instance && instance.getInitialData) {
        return instance
          .getInitialData(serverContext)
          .catch((error) => {
            reject(error)
            return false
          })
      }
    }, {}, {}).then(() => resolve(dataStore.get()))
  )
}

export {
  getAppInitialData
}
