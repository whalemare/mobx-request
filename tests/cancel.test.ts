import { RequestStore } from '../src/RequestStore'
import { CancelationError } from '../src/request/CancelationError'

import { delay } from './delay'

describe(`when cancel RequestStore`, () => {
  test(`with promise.cancel, onCancel should be called`, () => {
    const cancelHandler = jest.fn()
    const store = new RequestStore(async (_, { onCancel }) => {
      onCancel(cancelHandler)
    })
    const promise = store.fetch()
    promise.cancel()

    expect(cancelHandler).toBeCalledTimes(1)
  })

  test(`with store.cancel, onCancel should be called`, () => {
    const cancelHandler = jest.fn()
    const store = new RequestStore(async (_, { onCancel }) => {
      onCancel(cancelHandler)
    })
    void store.fetch()
    store.cancel()

    expect(cancelHandler).toBeCalledTimes(1)
  })

  test(`request should be throw CancellationError when onCancel not overrided in request`, async () => {
    const funcInsidePromise = jest.fn()
    const funcAfterAwait = jest.fn()
    const funcCatch = jest.fn()

    const store = new RequestStore(async () => {
      await delay(1)
      funcInsidePromise()
      return 4
    })
    const promise = store.fetch()
    try {
      promise.cancel()
      await promise
      funcAfterAwait()
    } catch (e) {
      funcCatch(e)
    } finally {
      expect(funcInsidePromise).toBeCalledTimes(0)
      expect(funcAfterAwait).toBeCalledTimes(0)
      expect(funcCatch).toBeCalledWith(new CancelationError('CancellationError from RequestStore'))
    }
  })
})

export {}
