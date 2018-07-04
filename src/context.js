import createContext from 'create-react-context'
import { defaultDataStore } from './data-store'

/**
 * Provides `dataStore` created with {@link createDataStore} to {@link withData} components using [React Context](http://reactjs.org/docs/context.html).
 *
 * #### Props
 *
 * - `value` **DataStoreType**
 *
 * @name DataProvider
 *
 * @example
 *
 * import React from 'react'
 * import { createDataStore, DataProvider } from 'react-get-app-data'
 * import App from './app'
 *
 * const appElement = (
 *   <DataProvider value={createDataStore()}>
 *     <App />
 *   </DataProvider>
 * )
 */

const { Provider, Consumer } = createContext(defaultDataStore)

export {
  Provider as DataProvider,
  Consumer as DataConsumer
}
