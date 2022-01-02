import { Cancelable } from './Cancelable'
import { Errorable } from './Errorable'
import { Loadable } from './Loadable'
import { Progressable } from './Progressable'
import { RequestFetch } from './RequestFetch'

export interface Requestable<R = unknown, A = unknown, E extends Error = Error>
  extends Loadable,
    Errorable<E>,
    Progressable,
    Cancelable {
  fetch: RequestFetch<R, A>
  value: R | undefined
}
