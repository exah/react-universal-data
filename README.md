# 🗂 react-get-app-data

> Simple React HOC for getting intial and subsequent async data + SSR

## Install

```sh
$ yarn add react-get-app-data
```


## Usage

### HOC


```js
import 'isomorphic-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import { withData } from 'react-get-app-data'

const Page = ({ user = {} }) => <div>Hello {user.name}!</div>

const PageWithData = withData(() =>
  fetch('https://jsonplaceholder.typicode.com/users/1')
    .then(res => res.json())
    .then(user => ({ user }))
)(Page)

ReactDOM.render(<PageWithData />, document.getElementById('root'))
```

[![Edit pp98jzr4y7](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/pp98jzr4y7)


### Static property

```js
import 'isomorphic-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import { withData } from 'react-get-app-data'

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


### SSR

<details>
  
With two-step rendering on server

```js
// server.js

import React from 'react'
import { renderToString } from 'react-dom/server'
import { getAppInitialData } from 'react-get-app-data'
import { html } from 'common-tags'
import HomePage from './pages/home'

export default () => (req, res) => {
  const appTree = (
    <HomePage />
  )

  getAppInitialData(appTree)
    .then((initialData) => {
      const app = renderToString(appTree)

      res.send(html`
        <!DOCTYPE html>
        <html class="no-js">
          <body>
            <div id="app">${app}</div>
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

Hydrate app and initialData in client

```js
// client.js

import React from 'react'
import ReactDOM from 'react-dom'
import { hydrateData } from 'react-get-app-data'
import HomePage from './pages/home'

// Get server state
const { initialData } = (window._ssr || {})

// Restore app state
hydrateData(initialData)

// Render app
ReactDOM.hydrate((
  <HomePage />
), document.getElementById('app'))
```

</details>

## Related

- [react-tree-walker](https://github.com/ctrlplusb/react-tree-walker) - inside `getAppInitialData`
- [webpack-hot-server-middleware](https://www.npmjs.com/package/webpack-hot-server-middleware) - server-side entry for webpack
- [goremykina.com](https://github.com/exah/goremykina) - usage example

---

MIT © [John Grishin](http://johngrish.in)
