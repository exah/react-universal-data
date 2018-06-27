// @flow

import reactTreeWalker from 'react-tree-walker'
import { defaultDataStore } from './data-store'

import type {
  ElementType,
  DataStoreType
} from './types'

const getAppInitialData = (
  tree: ElementType,
  context: Object,
  dataStore: DataStoreType = defaultDataStore
): Promise<any> => {
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
