import { AsyncState, Key, Fetcher } from './types'
import { useRUD } from './use-rud'

type Props<T> = {
  id: Key
  fetcher: Fetcher<T>
  children: (state: AsyncState<T>) => React.ReactNode
}

export const RUD = <T>({ id, fetcher, children }: Props<T>) =>
  children(useRUD(fetcher, id))
