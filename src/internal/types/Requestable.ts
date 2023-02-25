import { Cancelable } from '../../shared/types/Cancelable'
import { Errorable } from '../../shared/types/Errorable'
import { Loadable } from '../../shared/types/Loadable'
import { Progressable } from '../../shared/types/Progressable'
import { RequestFetch } from './RequestFetch'

export interface Requestable<R = unknown, A = unknown, E extends Error = Error>
  extends Loadable,
    Errorable<E>,
    Progressable,
    Cancelable {
  fetch: RequestFetch<R, A>
  value: R | undefined
}
