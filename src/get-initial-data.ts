import prepass from 'react-ssr-prepass'
import { RawStore } from './types'
import { defaultStore } from './store'

function getInitialData(element: React.ElementType, store = defaultStore) {
  store.clear()

  return prepass(element).then<RawStore>(() => Array.from(store))
}

export { getInitialData }
