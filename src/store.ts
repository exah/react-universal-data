import { Key } from './types'

export const createStore = <T = any>(init?: [Key, T][]) => {
  const store = new Map(init)
  const timer = new Map()

  function hasTTL(key: Key) {
    return timer.has(key)
  }

  function deleteTTL(key: Key) {
    clearTimeout(timer.get(key))
    timer.delete(key)
  }

  function setTTL(key: Key, ttl?: number) {
    deleteTTL(key)

    if (ttl) {
      timer.set(
        key,
        setTimeout(() => {
          store.delete(key)
          timer.delete(key)
        }, ttl)
      )
    }
  }

  function purge() {
    timer.forEach((_, key) => deleteTTL(key))
    store.clear()
  }

  return Object.assign(store, { hasTTL, setTTL, purge })
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
