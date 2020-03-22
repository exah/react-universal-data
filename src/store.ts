import { RawStore } from './types'

export const createStore = (input?: RawStore) => new Map(input)

export const defaultStore = createStore()

export function hydrateData(input: RawStore) {
  input.forEach(([key, value]) => {
    defaultStore.set(key, value)
  })
}
