import { RequestProps } from './RequestProps'

export type RequestFetch<R, A = undefined> = A extends undefined
  ? (arg?: A, props?: RequestProps) => Promise<R>
  : (arg: A, props?: RequestProps) => Promise<R>
