// @flow

import type {
  ElementType,
  DataStoreType
} from './types'

import reactTreeWalker from 'react-tree-walker'
import { defaultDataStore } from './data-store'

const getAppInitialData = (
  tree: ElementType,
  context: Object,
  dataStore: DataStoreType = defaultDataStore
): Promise<Object> => {
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
