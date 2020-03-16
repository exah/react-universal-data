import '@testing-library/jest-dom'

import React from 'react'
import { render } from '@testing-library/react'
import { getInitialData } from './get-initial-data'
import { RUD } from './rud'
import { useRUD } from './use-rud'

jest.mock('./constants', () => ({
  ...jest.requireActual('./constants'),
  IS_CLIENT: false,
  IS_SERVER: true,
}))

test('should render response from `RUD`', async () => {
  const A = ({ response }) => <div data-testid="response">{response}</div>
  const B = (props) => <A {...props} />
  const C = (props) => <B {...props} />

  const D = () => (
    <RUD fetcher={() => ({ response: 'Foo' })} id="D-comp">
      {(state) => <C {...state.result} />}
    </RUD>
  )

  const element = <D />
  const data = await getInitialData(element)

  const { getByTestId } = render(element)

  expect(getByTestId('response')).toHaveTextContent('Foo')
  expect(data['D-comp']).toEqual({ response: 'Foo' })
})

test('should render response from `useRUD`', async () => {
  const A = ({ response }) => <div data-testid="response">{response}</div>

  function B(props) {
    const state = useRUD(() => ({ response: 'Bar' }), 'B-comp')
    const response = state.isReady
      ? `${props.response} ${state.result.response}`
      : 'Not Ready'

    return <A response={response} />
  }

  const C = (props) => <B {...props} />

  function D() {
    const state = useRUD(() => ({ response: 'Foo' }), 'D-comp')

    return <C {...state.result} />
  }

  const element = <D />
  const data = await getInitialData(element)

  const { getByTestId } = render(element)

  expect(getByTestId('response')).toHaveTextContent('Foo Bar')
  expect(data['B-comp']).toEqual({ response: 'Bar' })
  expect(data['D-comp']).toEqual({ response: 'Foo' })
})
