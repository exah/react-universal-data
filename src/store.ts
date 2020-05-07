import { Key } from './types'
import { IS_SERVER } from './constants'

export const createStore = <T = any>(input?: [Key, T][]) => {
  const store = new Map(input)
  const timer = new Map()

  return {
    has(key: Key) {
      return store.has(key)
    },
    get(key: Key) {
      return store.get(key)
    },
    set(key: Key, value: T, ttl?: number) {
      if (timer.has(key)) {
        clearTimeout(timer.get(key))
        timer.delete(key)
      }

      if (ttl && !IS_SERVER) {
        timer.set(
          key,
          setTimeout(() => {
            store.delete(key)
            timer.delete(key)
          }, ttl)
        )
      }

      return store.set(key, value)
    },
    delete(key: Key) {
      store.delete(key)
    },
    get size() {
      return store.size
    },
    clear() {
      timer.forEach((id) => clearTimeout(id))
      timer.clear()
      store.clear()
    },
    flush() {
      return Array.from(store)
    },
  }
}

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
