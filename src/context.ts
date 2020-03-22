import { createContext } from 'react'
import { defaultStore } from './store'

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
 * import { createDataStore, DataProvider } from 'react-universal-data'
 * import App from './app'
 *
 * const appElement = (
 *   <DataProvider value={createDataStore()}>
 *     <App />
 *   </DataProvider>
 * )
 */

export const DataContext = createContext(defaultStore)

export const DataProvider = DataContext.Provider
export const DataConsumer = DataContext.Consumer
