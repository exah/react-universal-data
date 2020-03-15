import prepass from 'react-ssr-prepass'
import { Store } from './types'
import { defaultDataStore } from './data-store'

function getInitialData(
  element: React.ElementType,
  dataStore: Store = defaultDataStore
): Promise<ReturnType<typeof dataStore['get']>> {
  dataStore.init({})

  return new Promise((resolve, reject) =>
    prepass(element)
      .then(() => {
        dataStore.resetIds() // prepare for next render
        resolve(dataStore.get())
      })
      .catch((error: Error) => {
        reject(error)
      })
  )
}

export { getInitialData }
