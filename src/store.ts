import { RawData, Key } from './types'

export const defaultStore = new Map<Key, any>()

export const hydrateData = (input: RawData) =>
  input.forEach(([key, value]) => {
    defaultStore.set(key, value)
  })
