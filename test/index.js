/* eslint react/prop-types: 0 */
import test from 'ava'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { getAppInitialData } from '../src/get-app-initial-data'
import { withData } from '../src/with-data'
import { wait } from './_helpers'

const TestApp = ({ message }) => (
  <div>
    {message}
  </div>
)

const TestAppWithData = withData((props) =>
  wait(200)
    .then(() => ({ message: 'ok' }))
)(TestApp)

const appTree = (<TestAppWithData />)

test('getAppInitialData + withData', async (t) => {
  const initialData = await getAppInitialData(appTree)
  const appString = renderToString(appTree)

  t.is(initialData['1'].message, 'ok')
  t.is(appString, '<div>ok</div>')
})
