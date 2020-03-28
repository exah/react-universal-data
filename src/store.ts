import { Key } from './types'

export const createStore = <T = any>(input?: [Key, T][]) => new Map(input)

export const defaultStore = createStore()

/**
 * Hydrates initial data gathered with [getInitialData](https://github.com/exah/react-universal-data#getInitialData)
 * before rendering the app in the browser.
 *
 * @see https://github.com/exah/react-universal-data#hydrateInitialData
 */

export function hydrateInitialData<T = any>(input: [Key, T][]) {
  input.forEach(([key, value]) => {
    defaultStore.set(key, value)
  })
}
