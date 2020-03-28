import '@testing-library/jest-dom'

import React from 'react'
import { render } from '@testing-library/react'
import { getInitialData } from './get-initial-data'
import { useFetchData } from './use-fetch-data'
import { DataProvider } from './context'
import { defaultStore } from './store'

jest.mock('./constants', () => ({
  ...jest.requireActual('./constants'),
  IS_SERVER: true,
}))

beforeEach(() => defaultStore.clear())

test('should render response', async () => {
  const A = ({ response }) => <div data-testid="response">{response}</div>

  function B(props) {
    const state = useFetchData(() => ({ response: 'Bar' }), 'B')
    const response = state.isReady
      ? `${props.response} ${state.result.response}`
      : 'Not Ready'

    return <A response={response} />
  }

  const C = (props) => <B {...props} />

  function D() {
    const state = useFetchData(() => ({ response: 'Foo' }), 'D')

    return <C {...state.result} />
  }

  const element = <D />
  const data = new Map(await getInitialData(element))

  const { getByTestId } = render(element)

  expect(getByTestId('response')).toHaveTextContent('Foo Bar')
  expect(data.get('B')).toEqual({ response: 'Bar' })
  expect(data.get('D')).toEqual({ response: 'Foo' })
})

test('should throw error on rejected request', async () => {
  const A = ({ response }) => <div data-testid="response">{response}</div>

  function B() {
    const state = useFetchData(() => Promise.reject(new Error('Bar')), 'B')

    return <A {...state.result} />
  }

  const C = (props) => <B {...props} />

  function D() {
    const state = useFetchData(() => Promise.reject(new Error('Foo')), 'D')

    return <C {...state.result} />
  }

  await expect(getInitialData(<D />)).rejects.toThrow('Foo')
})

test('should throw error from plain function', async () => {
  function A() {
    useFetchData(() => {
      throw new Error('Foo')
    }, 'A')

    return null
  }

  await expect(getInitialData(<A />)).rejects.toThrow('Foo')
})

test('should able to provide custom store', async () => {
  function A() {
    const state = useFetchData(() => 'Foo', 'A')

    return <div data-testid="response">{state.result}</div>
  }

  const store = new Map()
  const element = (
    <DataProvider value={store}>
      <A />
    </DataProvider>
  )

  await getInitialData(element, store)
  const { getByTestId } = render(element)

  expect(store.size).toBe(1)
  expect(store.get('A')).toBe('Foo')
  expect(getByTestId('response')).toHaveTextContent('Foo')
})
