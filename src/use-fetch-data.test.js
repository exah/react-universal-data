import { renderHook } from '@testing-library/react-hooks'
import { defaultStore } from './store'
import { useFetchData } from './use-fetch-data'

const CLIENT_CONTEXT = { isClient: true, isServer: false }

test('should use store value for first render and update state on next', async () => {
  const resource = jest.fn((key) => key)
  defaultStore.set('foo', 'bar')

  const { result, rerender, waitForNextUpdate } = renderHook(
    (key) => useFetchData(resource, key),
    { initialProps: 'foo' }
  )

  expect(defaultStore.get('foo')).toBe(undefined)
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
