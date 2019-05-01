// @flow

import type {
  ReactElement,
  DataStoreType
} from './types'

import prepass from 'react-ssr-prepass'
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
 * import { getInitialData } from 'react-universal-data'
 * import { html } from 'common-tags'
 *
 * import App from './app'
 *
 * export default () => (req, res) => {
 *   const appElement = (<App />)
 *
 *   getInitialData(appElement, { req, res })
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

const getInitialData = (
  rootElement: ReactElement<any>,
  serverContext: Object,
  dataStore: DataStoreType = defaultDataStore
): Promise<Object> => {
  dataStore.init()

  return new Promise((resolve, reject) =>
    prepass(rootElement, (el, instance: any) => {
      if (instance && instance.getInitialData) {
        return instance
          .getInitialData(serverContext)
          .catch((error) => {
            reject(error)
            throw error
          })
      }
    }).then(() => {
      dataStore.resetIds() // prepare for next render
      resolve(dataStore.get())
    }).catch((error) => {
      reject(error)
    })
  )
}

export {
  getInitialData
}
