// Any needed for correctly type generation depend on request creator function
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CancelablePromise } from 'cancelable-promise'
import { makeAutoObservable, runInAction } from 'mobx'

import { RequestFetch } from './request/RequestFetch'
import { RequestOptions } from './request/RequestOptions'
import { Requestable } from './request/Requestable'

export interface RequestStoreState {
  /**
   * Flag that indicates user want to refresh (receive newest) data
   */
  isRefreshing: boolean

  /**
   * Override default `cancelHandler` by passing your function inside `onCancel`
   */
  onCancel: (cancelHandler: () => void) => void
}

type RequestCreator<R, A = undefined> = (args: A, state: RequestStoreState) => Promise<R>

interface RequestProps {
  isRefresh: boolean
}

export class RequestStore<R, A = undefined, E extends Error = Error> implements Requestable<R, A, E> {
  private cancelablePromise?: CancelablePromise<R>

  isLoading = false
  isRefreshing = false
  error: E | undefined = undefined
  value: R | undefined = undefined

  // TODO: need find a way to mark args as optional, when it undefined
  // @ts-ignore
  fetch: RequestFetch<R, A, E> = (args: A, props?: RequestProps): CancelablePromise<R> => {
    this.#onRequestStarted(props)
    const cancelablePromise = new CancelablePromise<R>((resolve, reject, onCancel) => {
      this.createRequest(args, { isRefreshing: this.isRefreshing, onCancel }).then(resolve).catch(reject)
    })
      .then(this.#onRequestSuccess)
      .catch(this.#onRequestError)
    this.cancelablePromise = cancelablePromise
    return cancelablePromise
  }

  clear = () => {
    this.cancelablePromise?.cancel()
    this.isLoading = false
    this.isRefreshing = false
    this.error = undefined
    this.value = undefined
    this.cancelablePromise = undefined
  }

  #onRequestStarted = (props?: RequestProps) => {
    runInAction(() => {
      this.isLoading = true
      this.error = undefined
      this.isRefreshing = props?.isRefresh ?? false
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
    })
    throw error
  }

  #onRequestSuccess = (response: R) => {
    runInAction(() => {
      this.cancelablePromise = undefined
      this.isLoading = false
      this.error = undefined
      this.value = response
    })
    return response
  }

  cancel(): void {
    throw new Error('Method not implemented.')
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
