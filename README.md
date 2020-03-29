# 🗂 react-universal-data

[![](https://flat.badgen.net/npm/v/react-universal-data?cache=600)](https://www.npmjs.com/package/react-universal-data) [![](https://flat.badgen.net/bundlephobia/minzip/react-universal-data?cache=600)](https://bundlephobia.com/result?p=react-universal-data) ![](https://flat.badgen.net/travis/exah/react-universal-data?cache=600)

#### Easy to use hook for getting data on client and server side with effortless hydration of state

- [x] Only 600B minified and gziped
- [x] Simple hooks API
- [x] TypeScript
- [x] Can handle updates
- [x] [Suspense](http://reactjs.org/docs/concurrent-mode-suspense.html) on server side via [`react-ssr-prepass`](https://github.com/FormidableLabs/react-ssr-prepass) 💕

> _This is a NO BULLSHIT hook: just PLUG IT in your components, get ALL THE DATA you need (and some more) both CLIENT- and SERVER-side, HYDRATE that ~~bastard~~ app while SSRing like it's NO BIG DEAL, effortlessly PASS IT to the client and render THE SHIT out of it_
>
> [@razdvapoka](https://github.com/razdvapoka)

## 📦 Install

```sh
$ npm i -S react-universal-data
```

```sh
$ yarn add react-universal-data
```

## 📖 Docs

### `useFetchData`

Requests data and preserves the result to the state.

```ts
type useFetchData<T> = (
  // async function that can return any type of data
  fetcher: (id: string, context: { isServer: boolean }) => Promise<T>,
  // unique id that will be used for storing & hydrating data while SSR
  id: string
) => AsyncState<T>
```

> ⚠️ The `id` must be unique for the whole application.

Returned object can be in 4 different forms – depending on the promise's state.

```ts
export type AsyncState<T> =
  // initial
  | { isReady: false; isLoading: false; error: null; result: undefined }
  // fulfilled
  | { isReady: true; isLoading: false; error: null; result: T }
  // pending
  | { isReady: boolean; isLoading: true; error: Error | null; result?: T }
  // rejected
  | { isReady: false; isLoading: false; error: Error; result?: T }
```

<details><summary>👀 Fetch a sample post via <a href="https://jsonplaceholder.typicode.com">jsonplaceholder.typicode.com</a> API</summary>

```js
import React from 'react'
import { useFetchData } from 'react-universal-data'

const fetchPost = (id) =>
  fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
    .then((response) => response.json())

function Post({ id }) {
  const { isReady, isLoading, result, error } = useFetchData(fetchPost, id)

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Oh no: {error.message}</p>
  }

  // You can depend on `isReady` flag to ensure data loaded correctly
  if (isReady) {
    return (
      <article>
        <h2>{result.title}</h2>
        <p>{result.body}</p>
      </article>
    )
  }

  return null
}
```
</details>

As the hook depends on the `fetcher` function identity to be stable, please, wrap it inside `useCallback` or define it outside of the render function to prevent infinite updates.

```js
import React, { useCallback } from 'react'
import { useFetchData } from 'react-universal-data'

function UserPosts({ userId }) {
  const fetchPosts = useCallback(() => (
    fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
      .then((response) => response.json())
  ), [userId]) // will pereform update if value changed

  const { result = [] } = useFetchData(fetchPosts, 'user-posts')

  return (
    <ul>
      {result.map((post) => <li key={post.id}>{post.title}</li>)}
    </ul>
  )
}
```

<details><summary>👀 Create a custom hook for it</summary>

```js
import React, { useCallback } from 'react'
import { useFetchData } from 'react-universal-data'

function useFetchUserPosts(userId) {
  return useFetchData(
    useCallback(() => (
      fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
        .then((response) => response.json())
    ), [userId]),
    'user-posts'
  )
}

function UserPosts({ userId }) {
  const { result = [] } = useFetchUserPosts(userId)

  return (
    <ul>
      {result.map((post) => <li key={post.id}>{post.title}</li>)}
    </ul>
  )
}
```
</details>

### `getInitialData`

Handles `useFetchData` on server side and gathers results for [hydration](#hydrateInitialData) in the browser.

```ts
type getInitialData = (element: JSX.Element) => Promise<[string, any][]>
```

```js
// server.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { getInitialData } from 'react-universal-data'
import { App } from './App'

async function server(req, res) {
  const element = <App />

  const data = await getInitialData(element).catch((error) => /* handle error */)
  const html = renderToString(
    <html>
      <body>
        <div id='app'>{element}</div>
        <script
          dangerouslySetInnerHTML={{
            __html: `window._ssr = ${JSON.stringify(data)};`,
          }}
        />
        <script src='/client.js' />
      </body>
    </html>
  )

  res.write('<!DOCTYPE html>')
  res.write(html)
  res.end()
}
```

### `hydrateInitialData`

Hydrates initial data gathered with [`getInitialData`](#getInitialData) before rendering the app in the browser.

```ts
type hydrateInitialData = (initial: [string, any][]) => void
```

```js
// client.js
import React from 'react'
import ReactDOM from 'react-dom'
import { hydrateInitialData } from 'react-universal-data'
import { App } from './App'

hydrateInitialData(window._ssr || [])
ReactDOM.hydrate(<App />, document.getElementById('app'))
```


## 💻 Demo

[![Edit react-universal-data-ssr](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-universal-data-ssr-jp9el?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.js&theme=dark)

## 🔗 Related

### Packages

- [`react-ssr-prepass`](https://github.com/FormidableLabs/react-ssr-prepass) - server-side dependency
- [`ya-fetch`](https://github.com/exah/ya-fetch) - a lightweight wrapper around `fetch`

### Real world usages

- [kayway.me](https://github.com/exah/kayway)
- [goremykina.com](https://github.com/exah/goremykina)
- [strelkamag.com](https://strelkamag.com)

---

MIT © [John Grishin](http://johngrish.in)
