# 🗂 react-universal-data

> Super lightweight hook to request data on server and in browser with seamless hydration of state

- [x] Only 600B minified and gziped
- [x] Simple hooks API
- [x] TypeScript
- [x] Can handle updates
- [x] [Suspense](http://reactjs.org/docs/concurrent-mode-suspense.html) on server side via [`react-ssr-prepass`](https://github.com/FormidableLabs/react-ssr-prepass) 💕

## 📦 Install

```sh
$ npm i -S react-universal-data
```

```sh
$ yarn add react-universal-data
```

## 📖 Docs

### `useFetchData`

Request data and save result to state.

```ts
type useFetchData<T> = (
  // async function that can return any type of data
  resource: (id: string, context: { isServer: boolean }) => Promise<T>,
  // unique id that will be used for storing & hydrating data while SSR
  id: string
) => AsyncState<T>
```

> ⚠️ NOTE: `id` must be unique for whole application.

Returned object can be in 4 different forms – depending on promise state.

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

<details><summary>Fetch post data via [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com) API</summary>

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

As hook depends on `resource` function identity to be stable, so wrap it inside
`useCallback` or define it outside the render function.

```js
import React, { useCallback } from 'react'
import { useFetchData } from 'react-universal-data'

function UserPosts({ userId }) {
  const fetchPosts = useCallback(() => (
    fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
      .then((response) => response.json())
  ), [userId]) // will pereform update if value changed

  const { result = [] } = useFetchData(fetchPost, 'user-posts')

  return (
    <ul>
      {result.map((post) => <li key={post.id}>{post.title}</li>)}
    </ul>
  )
}
```

## 💻 Demo

[![Edit react-universal-data-ssr](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-universal-data-ssr-jp9el?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.js&theme=dark)

## 🔗 Links

### Packages

- [`react-ssr-prepass`](https://github.com/FormidableLabs/react-ssr-prepass)
- [`ya-fetch`](https://github.com/exah/ya-fetch) - lightweight wrapper around `fetch`

### Sites

- [goremykina.com](https://github.com/exah/goremykina)
- [kayway.me](https://github.com/exah/kayway)

---

MIT © [John Grishin](http://johngrish.in)
