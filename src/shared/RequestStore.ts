// Any needed for correctly type generation depend on request creator function
/* eslint-disable @typescript-eslint/no-explicit-any */

import { flow, makeAutoObservable, runInAction } from 'mobx'
import type { CancellablePromise } from 'mobx/dist/internal'

import type { RequestCreator } from '../internal/types/RequestCreator'
import { RequestFetch } from '../internal/types/RequestFetch'
import { RequestOptions } from '../internal/types/RequestOptions'
import { RequestProps } from '../internal/types/RequestProps'
import { Requestable } from '../internal/types/Requestable'

export interface RequestStoreState {
  /**
   * Flag that indicates user want to refresh (receive newest) data
   */
  isRefreshing: boolean

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

  /**
   * Signal for your request, that is should be aborted
   *
   * Can be passed directly to axios, fetch and etc
   */
  signal: AbortSignal
}

export class RequestStore<R, A = undefined, E extends Error = Error> implements Requestable<R, A, E> {
  private cancellable?: [CancellablePromise<R>, AbortController] | undefined = undefined

  private start = flow(function* (this: RequestStore<R, A, E>, args: A, signal: AbortSignal, props?: RequestProps) {
    this.#onRequestStarted(props)
    try {
      const response = yield this.createRequest(args, {
        isRefreshing: this.isRefreshing,
        onProgress: this.#onProgress,
        signal: signal,
      })
      this.#onRequestSuccess(response)
      return response
    } catch (e) {
      this.#onRequestError(e)
      throw e
    }
  })

  private onErrorCallback?: (e: Error) => void = undefined

  isLoading = false
  isRefreshing = false
  /**
   * *undefined* - when request not called yet
   *
   * *null* - when request called but not finished
   *
   * *true* - when last call of request finished with success and have no errors
   *
   * *false* - when last call of request finished with error
   */
  isSuccess: boolean | undefined | null = undefined
  error: E | undefined = undefined
  value: R | undefined = undefined
  progress = 0

  // TODO: need find a way to mark args as optional, when it undefined
  // @ts-ignore
  fetch: RequestFetch<R, A> = async (args: A, props?: RequestProps) => {
    if (this.isLoading) {
      if (props?.isRefresh) {
        // cancel request that in progress and create new one
        this.cancel()
      } else {
        // unable to create fetch on already loaded request, just skip it
        if (this.cancellable) {
          return this.cancellable[0]
        } else {
          // just do another request, because previous is not exists
        }
      }
    }

    const abort = new AbortController()
    const cancellablePromise = this.start(args, abort.signal, props)
    this.cancellable = [cancellablePromise, abort]

    return cancellablePromise
  }

  clear = () => {
    this.cancel()
    this.isLoading = false
    this.isRefreshing = false
    this.error = undefined
    this.value = undefined
    this.cancellable = undefined
  }

  cancel = (): void => {
    if (this.cancellable) {
      this.cancellable[1].abort()
      this.cancellable[0].cancel()
    }
  }

  #onRequestStarted = (props?: RequestProps) => {
    runInAction(() => {
      this.cancellable = undefined
      this.isLoading = true
      this.error = undefined
      this.isRefreshing = props?.isRefresh ?? false
      this.progress = 0
      this.isSuccess = null
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
      this.cancellable = undefined
      this.isLoading = false
      this.isRefreshing = false
      this.error = error as E
      this.progress = 0
      this.isSuccess = false
    })
    this.onErrorCallback?.(error)
    throw error
  }

  #onRequestSuccess = (response: R) => {
    runInAction(() => {
      this.cancellable = undefined
      this.isLoading = false
      this.error = undefined
      this.value = response
      this.progress = 1
      this.isRefreshing = false
      this.isSuccess = true
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
      this.onErrorCallback = options.onError
    }

    makeAutoObservable(this)
  }
}
