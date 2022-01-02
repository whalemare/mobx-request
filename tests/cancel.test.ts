import { isPromiseWithCancel } from 'real-cancellable-promise'

import { RequestStore } from '../src/RequestStore'
import { CancelationError } from '../src/request/CancelationError'

import { delay } from './delay'

describe(`when cancel RequestStore`, () => {
  describe(`when onCancel override without throwing any error`, () => {
    test(`promise should NOT BE REJECTED`, () => {
      const afterOnCancel = jest.fn()
      const rejected = jest.fn()

      const store = new RequestStore(async (_, { onCancel }) => {
        onCancel(jest.fn())
        afterOnCancel()
      })
      const promise = store.fetch()
      try {
        promise.cancel()
      } catch (e) {
        rejected(e)
      }
      expect(afterOnCancel).toBeCalledTimes(1)
      expect(rejected).toBeCalledTimes(0)
    })
  })

  describe(`when onCancel override with throw Error`, () => {
    test(`promise should be rejected with this error`, async () => {
      const afterCancel = jest.fn()

      const store = new RequestStore(async (_, { onCancel }) => {
        onCancel(() => {
          throw new CancelationError('cancelled from test')
        })
      })
      const promise = store.fetch()

      const catched = jest.fn()
      try {
        promise.cancel()
        afterCancel()
      } catch (e) {
        catched(e)
      }
      expect(catched).toBeCalledWith(new CancelationError('cancelled from test'))
      expect(afterCancel).toBeCalledTimes(0)
    })

    test(`request function should be continued`, async () => {
      const afterOnCancelInsideRequest = jest.fn()
      const catched = jest.fn()
      const store = new RequestStore(async (_, { onCancel }) => {
        onCancel(() => {
          throw new CancelationError('cancelled from test')
        })
        afterOnCancelInsideRequest()
      })
      const promise = store.fetch()
      try {
        promise.cancel()
      } catch (e) {
        catched(e)
        isPromiseWithCancel(promise)
      }
      expect(afterOnCancelInsideRequest).toBeCalledTimes(1)
    })
  })

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
