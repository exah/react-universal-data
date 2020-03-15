import '@testing-library/jest-dom'

import React from 'react'
import { render } from '@testing-library/react'
import { getInitialData } from './get-initial-data'
import { withGetInitialProps } from './with-get-initial-props'
import { useRUD } from './use-rud'

jest.mock('./constants', () => ({
  IS_CLIENT: false,
  IS_SERVER: true,
  INITIAL_ID: -1,
}))

test('should render response from `withData`', async () => {
  const A = ({ response }) => <div data-testid="response">{response}</div>
  const B = (props) => <A {...props} />
  const C = (props) => <B {...props} />

  C.getInitialProps = () => {
    return { response: 'Foo' }
  }

  const D = withGetInitialProps(C)

  const element = <D />
  const data = await getInitialData(element)

  const { getByTestId } = render(element)

  expect(getByTestId('response')).toHaveTextContent('Foo')
  expect(data['0']).toEqual({ response: 'Foo' })
})

test('should render response from `useUniversalData`', async () => {
  const A = ({ response }) => <div data-testid="response">{response}</div>

  function B(props) {
    const state = useRUD(() => ({ response: 'Bar' }), 'B-comp')
    const response = state.isReady
      ? `${props.response} ${state.data.response}`
      : 'Not Ready'

    return <A response={response} />
  }

  const C = (props) => <B {...props} />

  function D() {
    const state = useRUD(() => ({ response: 'Foo' }), 'D-comp')
    const response = state.isReady ? state.data.response : 'Not Ready'

    return <C response={response} />
  }

  const element = <D />
  const data = await getInitialData(element)

  const { getByTestId } = render(element)

  expect(getByTestId('response')).toHaveTextContent('Foo Bar')
  expect(data['B-comp']).toEqual({ response: 'Bar' })
  expect(data['D-comp']).toEqual({ response: 'Foo' })
})
