import { createStore, defaultStore, hydrateInitialData } from './store'

test('`creatStore` should return `Map`', () => {
  expect(createStore()).toBeInstanceOf(Map)
})

test('`defaultStore` should be empty `Map`', () => {
  expect(defaultStore).toBeInstanceOf(Map)
  expect(defaultStore.size).toBe(0)
})

test('`hydrateData` should fill data in `defaultStore`', () => {
  expect(defaultStore.size).toBe(0)
  hydrateInitialData([['foo', 'bar']])
  expect(defaultStore.size).toBe(1)
  expect(defaultStore.get('foo')).toBe('bar')
})
