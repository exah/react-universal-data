import prepass from 'react-ssr-prepass'
import { defaultStore } from './data-store'

function getInitialData(
  element: React.ElementType,
  store = defaultStore
): Promise<ReturnType<typeof store['get']>> {
  store.clear()

  return prepass(element).then(() => Array.from(store))
}

export { getInitialData }
