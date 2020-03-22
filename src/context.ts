import { createContext } from 'react'
import { defaultStore } from './store'

/**
 * Provides `store` created with {@link createStore} to {@link useFetchData} hook using [React Context](http://reactjs.org/docs/context.html).
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
 * import { createStore, DataProvider } from 'react-universal-data'
 * import App from './app'
 *
 * const appElement = (
 *   <DataProvider value={createStore()}>
 *     <App />
 *   </DataProvider>
 * )
 */

export const DataContext = createContext(defaultStore)

export const DataProvider = DataContext.Provider
export const DataConsumer = DataContext.Consumer
