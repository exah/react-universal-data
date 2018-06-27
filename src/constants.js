const isClient = typeof window !== 'undefined'
const isServer = !isClient

export {
  isClient,
  isServer
}
