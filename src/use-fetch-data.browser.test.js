import { renderHook } from '@testing-library/react-hooks'
import { defaultStore, hydrateInitialData } from './store'
import { used, useFetchData } from './use-fetch-data.browser'

const CLIENT_CONTEXT = { isServer: false }

beforeEach(() => {
  used.clear()
  defaultStore.clear()
})

test('should use store value for first render and update state on next', async () => {
  const resource = jest.fn((key) => key)

  hydrateInitialData([['foo', 'bar']])

  const { result, rerender, waitForNextUpdate } = renderHook(
    (key) => useFetchData(resource, key),
    { initialProps: 'foo' }
  )

  expect(result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'bar',
  })

  rerender('baz')

  expect(result.current).toEqual({
    isReady: true,
    isLoading: true,
    error: null,
    result: 'bar',
  })

  await waitForNextUpdate()

  expect(result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'baz',
  })

  expect(resource).toBeCalledTimes(1)
  expect(resource).toBeCalledWith('baz', CLIENT_CONTEXT)
})

test('should fetch if data in store not available', async () => {
  const resource = jest.fn((key) => key)

  const { result, waitForNextUpdate } = renderHook(
    (key) => useFetchData(resource, key),
    { initialProps: 'foo' }
  )

  expect(result.current).toEqual({
    isReady: false,
    isLoading: true,
    error: null,
    result: undefined,
  })

  await waitForNextUpdate()

  expect(result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'foo',
  })

  expect(resource).toBeCalledTimes(1)
  expect(resource).toBeCalledWith('foo', CLIENT_CONTEXT)
})

test('should set `error` in state on failed request', async () => {
  const resource = jest.fn(() => {
    throw new Error('Foo')
  })

  const { result, waitForNextUpdate } = renderHook(() =>
    useFetchData(resource, 'foo')
  )

  expect(result.current).toEqual({
    isReady: false,
    isLoading: true,
    error: null,
    result: undefined,
  })

  await waitForNextUpdate()

  expect(result.current).toEqual({
    isReady: false,
    isLoading: false,
    error: new Error('Foo'),
    result: undefined,
  })

  expect(resource).toBeCalledTimes(1)
  expect(resource).toBeCalledWith('foo', CLIENT_CONTEXT)
})

test('should not request new data till it fresh (after hydration)', async () => {
  hydrateInitialData([['foo', 0]])

  const timers = jest.useFakeTimers()
  const ttl = 1000
  const resource = jest.fn()

  const setup = (index) =>
    renderHook(() =>
      useFetchData(
        resource.mockImplementation(() => index),
        'foo',
        ttl
      )
    )

  const first = setup(1)

  expect(first.result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 0,
  })

  first.rerender()

  expect(first.result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 0,
  })

  expect(resource).not.toHaveBeenCalled()

  timers.advanceTimersByTime(ttl / 2)
  first.unmount()

  const second = setup(2)

  expect(second.result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 0,
  })

  expect(resource).not.toHaveBeenCalled()

  timers.runAllTimers()
  second.unmount()

  const third = setup(3)

  expect(third.result.current).toEqual({
    isReady: false,
    isLoading: true,
    error: null,
    result: undefined,
  })

  await third.wait(() => {
    expect(third.result.current).toEqual({
      isReady: true,
      isLoading: false,
      error: null,
      result: 3,
    })
  })

  expect(resource).toHaveBeenCalledTimes(1)
})

test('should not request new data till it fresh (without hydration)', async () => {
  const timers = jest.useFakeTimers()
  const ttl = 1000
  const resource = jest.fn()

  const setup = (index) =>
    renderHook(() =>
      useFetchData(
        resource.mockImplementation(() => index),
        'foo',
        ttl
      )
    )

  const first = setup(1)

  expect(first.result.current).toEqual({
    isReady: false,
    isLoading: true,
    error: null,
    result: undefined,
  })

  await first.wait(() => {
    expect(first.result.current).toEqual({
      isReady: true,
      isLoading: false,
      error: null,
      result: 1,
    })
  })

  first.rerender()

  expect(first.result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 1,
  })

  expect(resource).toHaveBeenCalledTimes(1)

  timers.advanceTimersByTime(ttl / 2)
  first.unmount()

  const second = setup(2)

  expect(second.result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 1,
  })

  expect(resource).toHaveBeenCalledTimes(1)

  timers.runAllTimers()
  second.unmount()

  const third = setup(3)

  expect(third.result.current).toEqual({
    isReady: false,
    isLoading: true,
    error: null,
    result: undefined,
  })

  await third.wait(() => {
    expect(third.result.current).toEqual({
      isReady: true,
      isLoading: false,
      error: null,
      result: 3,
    })
  })

  expect(resource).toHaveBeenCalledTimes(2)
})

test('should not update state after unmount', async () => {
  const resource = jest.fn((key) => key)

  const { result, rerender, unmount, wait } = renderHook((key = 'foo') =>
    useFetchData(resource, key)
  )

  expect(result.current).toEqual({
    isReady: false,
    isLoading: true,
    error: null,
    result: undefined,
  })

  await wait(() => {
    expect(resource).toHaveBeenCalledTimes(1)
    expect(result.current).toEqual({
      isReady: true,
      isLoading: false,
      error: null,
      result: 'foo',
    })
  })

  rerender('bar')
  unmount()

  expect(result.current).toEqual({
    isReady: true,
    isLoading: true,
    error: null,
    result: 'foo',
  })
})

test('should use store value for first render and update state on next with cache', async () => {
  const ttl = 1000
  const timers = jest.useFakeTimers()
  const resource = jest.fn((key) => key)

  const { result, rerender, waitForNextUpdate } = renderHook(
    (key) => useFetchData(resource, key, ttl),
    { initialProps: 'foo' }
  )

  await waitForNextUpdate()

  expect(result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'foo',
  })

  rerender('bar')

  expect(result.current).toEqual({
    isReady: true,
    isLoading: true,
    error: null,
    result: 'foo',
  })

  await waitForNextUpdate()

  expect(result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'bar',
  })

  rerender('foo')

  expect(result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'foo',
  })

  expect(resource).toBeCalledTimes(2)

  timers.advanceTimersByTime(ttl)

  rerender('bar')

  expect(result.current).toEqual({
    isReady: true,
    isLoading: true,
    error: null,
    result: 'foo',
  })

  await waitForNextUpdate()

  expect(result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'bar',
  })
})

test('should use store value for first render and update on next mount', async () => {
  const resource = jest.fn((key) => key)

  hydrateInitialData([['foo', 'foo']])

  const first = renderHook(() => useFetchData(resource, 'foo'))

  expect(first.result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'foo',
  })

  first.unmount()

  const second = renderHook(() => useFetchData(resource, 'foo'))

  expect(second.result.current).toEqual({
    isReady: true,
    isLoading: true,
    error: null,
    result: 'foo',
  })

  await second.waitForNextUpdate()

  expect(second.result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'foo',
  })

  second.unmount()

  const third = renderHook(() => useFetchData(resource, 'foo'))

  expect(third.result.current).toEqual({
    isReady: true,
    isLoading: true,
    error: null,
    result: 'foo',
  })

  await third.waitForNextUpdate()

  expect(third.result.current).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'foo',
  })

  expect(resource).toBeCalledTimes(2)
})
