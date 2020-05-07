import { createStore, defaultStore, hydrateInitialData } from './store'

test('`creatStore` should return `Map` - like object', () => {
  expect(createStore()).toMatchObject({
    get: expect.any(Function),
    set: expect.any(Function),
    has: expect.any(Function),
    clear: expect.any(Function),
    delete: expect.any(Function),
    flush: expect.any(Function),
    size: 0,
  })
})

test('`defaultStore` should be empty', () => {
  expect(defaultStore.size).toBe(0)
})

test('`hydrateData` should fill data in `defaultStore`', () => {
  expect(defaultStore.size).toBe(0)
  hydrateInitialData([['foo', 'bar']])
  expect(defaultStore.size).toBe(1)
  expect(defaultStore.get('foo')).toBe('bar')
})
