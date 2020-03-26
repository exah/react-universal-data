import prepass from 'react-ssr-prepass'
import { RawStore } from './types'
import { defaultStore } from './store'

function getInitialData(element: JSX.Element, store = defaultStore) {
  store.clear()

  return prepass(element).then<RawStore>(() => Array.from(store))
}

export { getInitialData }
