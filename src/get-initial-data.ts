import prepass from 'react-ssr-prepass'
import { Key } from './types'
import { defaultStore } from './store'

/**
 * Handles [`useFetchData`](https://github.com/exah/react-universal-data#useFetchData)
 * on server side and gathers results for [hydration](https://github.com/exah/react-universal-data#hydrateInitialData)
 * in the browser.
 *
 * @see https://github.com/exah/react-universal-data#getInitialData
 */

function getInitialData<T = any>(element: JSX.Element, store = defaultStore) {
  store.purge()
  return prepass(element).then<[Key, T][]>(() => Array.from(store))
}

export { getInitialData }
