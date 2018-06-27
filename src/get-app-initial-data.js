import reactTreeWalker from 'react-tree-walker'
import { defaultDataStore } from './data-store'

const getAppInitialData = (tree, context, dataStore = defaultDataStore) => {
  dataStore.init()

  return new Promise((resolve, reject) =>
    reactTreeWalker(tree, (el, instance) => {
      if (instance && instance.getInitialData) {
        return instance
          .getInitialData(context)
          .catch((error) => {
            reject(error)
            return false
          })
      }
    }, {}, {}).then(() => resolve(dataStore.get()))
  )
}

export {
  getAppInitialData
}
