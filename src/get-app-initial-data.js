// @flow

import type {
  ReactElement,
  DataStoreType
} from './types'

import reactTreeWalker from 'react-tree-walker'
import { defaultDataStore } from './data-store'

/**
 * Request all app data from `withData` wrapped components deep inside app `tree`, useful on server for propper SSR.
 *
 * @param tree — Your app root element
 * @param context — Can be used to provide additional data to `GetDataFn` (like `req`, `res` from an `express` middleware).
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
 *   const appTree = (<App />)
 *
 *   getAppInitialData(appTree, { req, res })
 *     .then((initialData) => {
 *       res.send(html`
 *         <!DOCTYPE html>
 *         <html>
 *           <body>
 *             <div id="app">${renderToString(appTree)}</div>
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
  tree: ReactElement<any>,
  context: Object,
  dataStore: DataStoreType = defaultDataStore
): Promise<Object> => {
  dataStore.init()

  return new Promise((resolve, reject) =>
    reactTreeWalker(tree, (el, instance) => {
      if (instance && instance.getInitialData) {
        return instance
          .getInitialData(context)
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
