import { flow, observable, runInAction } from 'mobx'
import { FlowCancellationError } from 'mobx'

import { resolveError } from '../internal/resolveError'

const startRequest = flow(function* <R, A>(creator: AsyncFunction<R>, arg: A, state: WholeState<R>) {
  onRequestStarted(state)

  try {
    const result = yield creator(arg)

    return onRequestSuccess<R>(state, result)
  } catch (e) {
    if (e instanceof FlowCancellationError) {
      state.abortController?.abort()
    }
    throw onRequestError(state, e)
  }
})

type Fetch<Fn extends AsyncFunction, R extends ReturnType<Awaited<Fn>>> = Fn & {
  state: RequestState<R>
} & RequestActions

export function request<
  Fn extends AsyncFunction,
  R extends ReturnType<Awaited<Fn>>,
  A extends Parameters<Fn>[0] = Parameters<Fn>[0],
>(creator: Fn) {
  const cancel = () => {
    state.promise?.cancel()
  }

  const state = observable<RequestState<R> & InternalState<R>>({
    isLoading: false,
    value: null,
    error: null,
    isSuccess: undefined,
    progress: 0,
    promise: null,
    abortController: null,
  })

  const fetch = async (arg: A) => {
    if (!state.promise) {
      state.promise = startRequest(creator, arg, state)
      state.promise.cancel
    }

    return state.promise
  }

  // assign name to function for debug purposes
  if (creator.name) {
    Object.defineProperty(fetch, 'name', { value: creator.name, writable: false })
  }
  fetch.state = state as RequestState<R>
  fetch.cancel = cancel

  return fetch as Fetch<Fn, R>
}

function onRequestStarted<R>(state: WholeState<R>) {
  runInAction(() => {
    state.isLoading = true
    state.error = null
    state.abortController = new AbortController()
    state.isSuccess = null

    // this.cancellable = undefined
    // this.isRefreshing = props?.isRefresh ?? false
    // this.progress = 0
    // this.isSuccess = null
  })
}

function onRequestError<R>(state: WholeState<R>, e: unknown) {
  const error = resolveError(e)

  runInAction(() => {
    state.abortController = null
    state.error = error
    state.isLoading = false
    state.isSuccess = false
    state.progress = 0
    state.promise = null
  })

  return error
}

function onRequestSuccess<R>(state: WholeState<R>, response: R) {
  runInAction(() => {
    state.abortController = null
    state.error = null
    state.isLoading = false
    state.isSuccess = true
    state.progress = 1
    state.promise = null
    state.value = response
  })
  return response
}

export type RequestCreator<R, A = undefined> = (args: A) => Promise<R>

// any required for autotupe inheritance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFunction<R = any> = (args: any) => Promise<R>

interface InternalState<R> {
  abortController: AbortController | null
  promise: CancellablePromise<R> | null
}

interface RequestState<R> {
  isLoading: boolean
  value: R | null

  /**
   * When your request failed, you can get error here
   *
   * When error is not instance of *Error* it will be wrapped
   */
  error: Error | null

  /**
   * *undefined* - when request not called yet
   *
   * *null* - when request called but not finished
   *
   * *true* - when last call of request finished with success and have no errors
   *
   * *false* - when last call of request finished with error
   */
  isSuccess: boolean | undefined | null

  /**
   * Usefull when you need to track your request state with more accuracy
   *
   * Calculated by `event.loaded / event.total`, you should pass `ProgressEvent` to `onProgress` callback inside your request.
   *
   * When #onProgress is not called, by default it will be
   * ```
   * 0 before fetch()
   * 1 after success
   * 0 after error
   * ```
   *
   * @returns value in 0..1 range
   */
  progress: number
}

interface RequestActions {
  cancel: () => void
}

type WholeState<R> = RequestState<R> & InternalState<R>

type CancellablePromise<R> = Promise<R> & { cancel: () => void }
