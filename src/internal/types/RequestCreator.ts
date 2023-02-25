import { RequestStoreState } from "../../shared/RequestStore";

export type RequestCreator<R, A = undefined> = (args: A, state: RequestStoreState) => Promise<R>
