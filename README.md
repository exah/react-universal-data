# 🗂 react-universal-data

> Simple HOC and utils for getting initial and subsequent async data inside React components

- [x] Promise based
- [x] Request data inside HOC or React Component `getData` static prop
- [x] Simple server-side rendering & client state restoration
- [x] Can handle updates
- [ ] React-Redux support (coming in 🔖 3.x)

## Install

```sh
$ yarn add react-universal-data
```

## [API](./docs/api.md)

## Example

Inside `withData` HOC


```js
import 'isomorphic-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import { withData } from 'react-universal-data'

const Page = ({ user = {} }) => <div>Hello {user.name}!</div>

const PageWithData = withData(() =>
  fetch('https://jsonplaceholder.typicode.com/users/1')
    .then(res => res.json())
    .then(user => ({ user }))
)(Page)

ReactDOM.render(<PageWithData />, document.getElementById('root'))
```

[![Edit pp98jzr4y7](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/pp98jzr4y7)

---

Or with static `getData` prop inside React Component

```js
import 'isomorphic-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import { withData } from 'react-universal-data'

class Page extends React.Component {
  static defaultProps = {
    user: {}
  }
  static async getData() {
    const user = await fetch(
      'https://jsonplaceholder.typicode.com/users/1'
    ).then(res => res.json())

    return {
      user
    }
  }
  render() {
    const { user } = this.props

    return <div>Hello {user.name}!</div>
  }
}

const PageWithData = withData()(Page)

ReactDOM.render(<PageWithData />, document.getElementById('root'))
```

[![Edit ovxkz1ojj9](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/ovxkz1ojj9)

---

### Server-Side Rendering
  
With two-step rendering on server

```js
// server.js

import React from 'react'
import { renderToString } from 'react-dom/server'
import { getInitialData } from 'react-universal-data'
import { html } from 'common-tags'
import App from './app'

export default () => (req, res) => {
  const appElement = (<App />)

  getInitialData(appElement)
    .then((initialData) => {
      res.send(html`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="app">${renderToString(appElement)}</div>
            <script>
              (function () {
                window._ssr = ${JSON.stringify({ initialData })};
              })();
            </script>
            <script src="/client.js"></script>
          </body>
        </html>
      `)
    })
    .catch((error) => {
      console.error(error)
      res.status(500)
      res.send(`Error: ${error.message}`)
    })
}
```

Hydrate `App` and `initialData` in client

```js
// client.js

import React from 'react'
import ReactDOM from 'react-dom'
import { hydrateData } from 'react-universal-data'
import App from './app'

// Get server state
const { initialData } = (window._ssr || {})

// Restore app state
hydrateData(initialData)

// Render app
ReactDOM.hydrate((
  <App />
), document.getElementById('app'))
```


## Links

- [react-tree-walker](https://github.com/ctrlplusb/react-tree-walker) - inside `getInitialData`
- [webpack-hot-server-middleware](https://www.npmjs.com/package/webpack-hot-server-middleware) - server-side entry for webpack
- [goremykina.com](https://github.com/exah/goremykina) - usage example

---

MIT © [John Grishin](http://johngrish.in)
