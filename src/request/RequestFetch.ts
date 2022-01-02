import { CancellablePromise } from 'mobx/dist/internal'

import { RequestProps } from './RequestProps'

export type RequestFetch<R, A = undefined, E extends Error = Error> = A extends undefined
  ? (arg?: A, props?: RequestProps) => CancellablePromise<R>
  : (arg: A, props?: RequestProps) => CancellablePromise<R>
