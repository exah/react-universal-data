import { createStore, defaultStore, hydrateInitialData } from './store'

beforeEach(() => {
  defaultStore.clear()
})

describe('createStore', () => {
  test('should return `Map`', () => {
    expect(createStore()).toBeInstanceOf(Map)
  })

  test('should be able to set TTL for `key` in store', () => {
    const ttl = 1000
    const timers = jest.useFakeTimers()
    const store = createStore()

    store.set('foo', 'bar')

    expect(store.has('foo')).toBe(true)
    expect(store.hasTTL('foo')).toBe(false)
    expect(store.get('foo')).toBe('bar')

    store.setTTL('foo', ttl)
    timers.advanceTimersByTime(ttl / 2)

    expect(store.has('foo')).toBe(true)
    expect(store.hasTTL('foo')).toBe(true)
    expect(store.get('foo')).toBe('bar')

    timers.advanceTimersByTime(ttl / 2)

    expect(store.has('foo')).toBe(false)
    expect(store.hasTTL('foo')).toBe(false)
    expect(store.get('foo')).toBe(undefined)
  })
})

describe('defaultStore', () => {
  test('should be empty `Map`', () => {
    expect(defaultStore).toBeInstanceOf(Map)
    expect(defaultStore.size).toBe(0)
  })
})

describe('hydrateData', () => {
  test('should fill data in `defaultStore`', () => {
    expect(defaultStore.size).toBe(0)
    hydrateInitialData([['foo', 'bar']])
    expect(defaultStore.size).toBe(1)
    expect(defaultStore.get('foo')).toBe('bar')
  })
})
