import { CancellablePromise } from 'mobx/dist/internal'

import { RequestOptions } from './RequestOptions'

export type RequestFetch<R, A = undefined, E extends Error = Error> = A extends undefined
  ? (arg?: A, props?: RequestOptions<R, E>) => CancellablePromise<R>
  : (arg: A, props?: RequestOptions<R, E>) => CancellablePromise<R>
