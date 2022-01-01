import { Cancelable } from './Cancelable'
import { Errorable } from './Errorable'
import { Loadable } from './Loadable'
import { RequestFetch } from './RequestFetch'

export interface Requestable<R = unknown, A = unknown, E extends Error = Error>
  extends Loadable,
    Errorable<E>,
    Cancelable {
  fetch: RequestFetch<R, A, E>
  value: R | undefined
}
