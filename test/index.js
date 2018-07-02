/* eslint react/prop-types: 0 */

import test from 'ava'
import React, { Component } from 'react'
import TestRenderer from 'react-test-renderer'
import { getAppInitialData } from '../src/get-app-initial-data'
import { withData } from '../src/with-data'
import { sleep } from './_helpers'

const FunctionalComp = ({ message }) => (
  <div>
    {message}
  </div>
)

const FunctionalCompWithData = withData(
  ({ result }) => sleep(10).then(() => result ? { message: `hoc-${result}` } : null)
)(FunctionalComp)

class ClassComp extends Component {
  static async getData ({ result }) {
    if (!result) return null

    await sleep(20)

    return {
      message: `static-${result}`
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

const ClassCompWithData = withData()(ClassComp)

const App = (props) => (
  <div>
    <FunctionalCompWithData {...props} />
    <ClassCompWithData {...props} />
  </div>
)

const appElement = (<App id={1} result='id-1' />)
const renderer = TestRenderer.create(appElement)
const fnComp = renderer.root.findByType(FunctionalComp)
const classComp = renderer.root.findByType(ClassComp)

test('withData: init: hoc callback', async (t) => {
  await sleep(10)

  t.is(fnComp.props.message, 'hoc-id-1')
  t.is(fnComp.parent.instance.state.data.message, 'hoc-id-1')
})

test('withData: init: class component getData static prop', async (t) => {
  await sleep(10)

  t.is(classComp.props.message, 'static-id-1')
})

test('getAppInitialData: call getInitialData prop in app element tree', async (t) => {
  const initialData = await getAppInitialData(appElement)

  t.is(initialData['1'].message, 'hoc-id-1')
  t.is(initialData['2'].message, 'static-id-1')
})

test('withData: update: callback', async (t) => {
  renderer.update(<App id={2} result='id-2' />)
  await sleep(20)

  t.is(fnComp.props.message, 'hoc-id-2')
})

test('withData: prevent update: null returned', async (t) => {
  renderer.update(<App id={3} result={null} />)
  await sleep(20)

  t.is(fnComp.props.message, 'hoc-id-2')
})

test('withData: prevent update: same id (default)', async (t) => {
  renderer.update(<App id={3} result='id-3' />)
  await sleep(100)

  t.is(fnComp.props.message, 'hoc-id-2')
})
