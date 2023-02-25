import type { RequestStoreState } from '../RequestStore'

export type RequestCreator<R, A = undefined> = (args: A, state: RequestStoreState) => Promise<R>
