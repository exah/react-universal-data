/* eslint react/prop-types: 0 */
import test from 'ava'
import React, { Component } from 'react'
import { renderToString } from 'react-dom/server'
import { getAppInitialData } from '../src/get-app-initial-data'
import { withData } from '../src/with-data'
import { sleep } from './_helpers'

const FunctionalTestApp = ({ message }) => (
  <div>
    {message}
  </div>
)

const FunctionalTestAppWithData = withData((props) =>
  sleep(200)
    .then(() => ({ message: 'hoc-result' }))
)(FunctionalTestApp)

test('withData as hoc', async (t) => {
  const tree = (<FunctionalTestAppWithData />)
  const initialData = await getAppInitialData(tree)
  const appString = renderToString(tree)

  t.is(initialData['1'].message, 'hoc-result')
  t.is(appString, '<div>hoc-result</div>')
})

class StaticPropTestApp extends Component {
  static async getData () {
    await sleep(200)

    return {
      message: 'static-prop-result'
    }
  }
  render () {
    return (
      <div>
        {this.props.message}
      </div>
    )
  }
}

const StaticPropTestAppWithData = withData()(StaticPropTestApp)

test('static getData property', async (t) => {
  const tree = (<StaticPropTestAppWithData />)
  const initialData = await getAppInitialData(tree)
  const appString = renderToString(tree)

  t.is(initialData['2'].message, 'static-prop-result')
  t.is(appString, '<div>static-prop-result</div>')
})
