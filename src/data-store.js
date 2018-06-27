const createDataStore = (initialData) => {
  let store = initialData || {}
  let pointer = 0

  return {
    init: (value) => {
      pointer = 0
      store = value || {}
    },
    save: (id, result) => {
      store[id] = result
    },
    nextId: () => {
      pointer += 1
      return pointer
    },
    getById: (id) => store[id],
    get: () => store
  }
}

const defaultDataStore = createDataStore()
const rehydrateData = (data) => defaultDataStore.init(data)

export {
  createDataStore,
  rehydrateData,
  defaultDataStore
}
