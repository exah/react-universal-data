import prepass from 'react-ssr-prepass'
import { RawData } from './types'
import { defaultStore } from './store'

function getInitialData(element: React.ElementType, store = defaultStore) {
  store.clear()

  return prepass(element).then<RawData>(() => Array.from(store))
}

export { getInitialData }
