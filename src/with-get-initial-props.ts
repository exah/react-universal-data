import { Fetcher, Merge } from './types'
import { withRUD } from './with-rud'

type Comp<D, P> = React.ComponentType<Merge<P, D>> & {
  getInitialProps?: Fetcher<D>
}

export const withGetInitialProps = <D = any, P = any>(Comp: Comp<D, P>) =>
  withRUD(Comp.getInitialProps)(Comp)
