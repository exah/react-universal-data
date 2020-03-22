import '@testing-library/jest-dom'

import React from 'react'
import { render } from '@testing-library/react'
import { getInitialData } from './get-initial-data'
import { useFetchData } from './use-fetch-data'

jest.mock('./constants', () => ({
  ...jest.requireActual('./constants'),
  IS_CLIENT: false,
  IS_SERVER: true,
}))

test('should render response from `useFetchData`', async () => {
  const A = ({ response }) => <div data-testid="response">{response}</div>

  function B(props) {
    const state = useFetchData(() => ({ response: 'Bar' }), 'B-comp')
    const response = state.isReady
      ? `${props.response} ${state.result.response}`
      : 'Not Ready'

    return <A response={response} />
  }

  const C = (props) => <B {...props} />

  function D() {
    const state = useFetchData(() => ({ response: 'Foo' }), 'D-comp')

    return <C {...state.result} />
  }

  const element = <D />
  const data = new Map(await getInitialData(element))

  const { getByTestId } = render(element)

  expect(getByTestId('response')).toHaveTextContent('Foo Bar')
  expect(data.get('B-comp')).toEqual({ response: 'Bar' })
  expect(data.get('D-comp')).toEqual({ response: 'Foo' })
})

test('should throw error from `useFetchData` on rejected request', async () => {
  const A = ({ response }) => <div data-testid="response">{response}</div>

  function B() {
    const state = useFetchData(() => Promise.reject(new Error('Bar')), 'B-comp')

    return <A {...state.result} />
  }

  const C = (props) => <B {...props} />

  function D() {
    const state = useFetchData(() => Promise.reject(new Error('Foo')), 'D-comp')

    return <C {...state.result} />
  }

  await expect(getInitialData(<D />)).rejects.toThrow('Foo')
})

test('should throw error from `useFetchData` in plain function', async () => {
  function B() {
    useFetchData(() => {
      throw new Error('Foo')
    }, 'D-comp')

    return null
  }

  await expect(getInitialData(<B />)).rejects.toThrow('Foo')
})
