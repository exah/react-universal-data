import { createContext } from 'react'
import { defaultStore } from './store'

export const DataContext = createContext(defaultStore)

export const DataProvider = DataContext.Provider
export const DataConsumer = DataContext.Consumer
