// Any needed for correctly type generation depend on request creator function
/* eslint-disable @typescript-eslint/no-explicit-any */

import { makeAutoObservable, runInAction } from 'mobx'
import { CancellablePromise } from 'real-cancellable-promise'

import { CancelationError } from './request/CancelationError'
import { ProgressEvent } from './request/ProgressEvent'
import { RequestFetch } from './request/RequestFetch'
import { RequestOptions } from './request/RequestOptions'
import { RequestProps } from './request/RequestProps'
import { Requestable } from './request/Requestable'

export interface RequestStoreState {
  /**
   * Flag that indicates user want to refresh (receive newest) data
   */
  isRefreshing: boolean

  /**
   * Override default `cancelHandler` by passing your function inside `onCancel`
   */
  onCancel: (cancelHandler: () => any) => void

  /**
   * Invoke it when you need to handle progress state of request with more accuracy
   *
   * By default `progress` will be
   *```
   * 0 before `.fetch()`
   * 1 after resolve
   * 0 after reject
   * ```
   */
  onProgress: (event: ProgressEvent) => void
}

type RequestCreator<R, A = undefined> = (args: A, state: RequestStoreState) => Promise<R>

export class RequestStore<R, A = undefined, E extends Error = Error> implements Requestable<R, A, E> {
  private cancelablePromise?: CancellablePromise<R>

  isLoading = false
  isRefreshing = false
  error: E | undefined = undefined
  value: R | undefined = undefined
  progress = 0

  // TODO: need find a way to mark args as optional, when it undefined
  // @ts-ignore
  fetch: RequestFetch<R, A> = (args: A, props?: RequestProps): CancellablePromise<R> => {
    if (this.isLoading && !props?.isRefresh) {
      // unable to create fetch on already loaded request, just skip it
      if (this.cancelablePromise) {
        return this.cancelablePromise
      } else {
        throw new Error(
          `Inconsistent state, isLoading ${this.isLoading} but cancelablePromise is ${this.cancelablePromise}`,
        )
      }
    }

    let cancelHandler = (): any => {
      throw new CancelationError('CancellationError from RequestStore')
    }

    this.#onRequestStarted(props)
    this.cancelablePromise = new CancellablePromise<R>(
      this.createRequest(args, {
        isRefreshing: this.isRefreshing,
        onProgress: this.#onProgress,
        onCancel: handler => (cancelHandler = handler),
      }),
      cancelHandler,
    )
      .then(this.#onRequestSuccess)
      .catch(this.#onRequestError)
    return this.cancelablePromise
  }

  clear() {
    this.cancel()
    this.isLoading = false
    this.isRefreshing = false
    this.error = undefined
    this.value = undefined
    this.cancelablePromise = undefined
  }

  cancel(): void {
    this.cancelablePromise?.cancel()
  }

  #onRequestStarted = (props?: RequestProps) => {
    runInAction(() => {
      this.cancelablePromise = undefined
      this.isLoading = true
      this.error = undefined
      this.isRefreshing = props?.isRefresh ?? false
      this.progress = 0
    })
  }

  #onRequestError = (e: unknown) => {
    let error: Error
    if (e instanceof Error) {
      error = e
    } else {
      error = new Error(typeof e === 'string' ? e : `Unable determine error type ${e}`)
    }

    runInAction(() => {
      this.cancelablePromise = undefined
      this.isLoading = false
      this.isRefreshing = false
      this.error = error as E
      this.progress = 0
    })
    throw error
  }

  #onRequestSuccess = (response: R) => {
    runInAction(() => {
      this.cancelablePromise = undefined
      this.isLoading = false
      this.error = undefined
      this.value = response
      this.progress = 1
      this.isRefreshing = false
    })
    return response
  }

  #onProgress = (event: ProgressEvent) => {
    if (this.isLoading) {
      runInAction(() => {
        if (event.total === 0) {
          this.progress = 0
        } else {
          this.progress = event.loaded / event.total
        }
      })
    } else {
      throw new Error('Unable to track progress of already finished event')
    }
  }

  constructor(private createRequest: RequestCreator<R, A>, options?: RequestOptions<R, E>) {
    if (options) {
      if (options.initial) {
        this.isLoading = options.initial.isLoading ?? false
        this.error = options.initial.error ?? undefined
        this.isRefreshing = options.initial.isRefreshing ?? false
        this.value = options.initial.value
      }
    }

    makeAutoObservable(this)
  }
}
