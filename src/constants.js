const IS_CLIENT = typeof window !== 'undefined'
const IS_SERVER = !IS_CLIENT
const INITIAL_ID = 0

export {
  IS_CLIENT,
  IS_SERVER,
  INITIAL_ID
}
