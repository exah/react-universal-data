import createContext from 'create-react-context'
import { defaultDataStore } from './data-store'

const { Provider, Consumer } = createContext(defaultDataStore)

export {
  Provider as DataProvider,
  Consumer as DataConsumer
}
