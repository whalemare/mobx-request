import { Errorable } from './Errorable'
import { Loadable } from './Loadable'

export interface RequestOptions<R, E extends Error> {
  /**
   * Initial state of RequestStore, when requests not be called yet
   */
  initial?: Partial<Loadable & Errorable<E> & { value: R; isRefreshing: boolean }>
}
