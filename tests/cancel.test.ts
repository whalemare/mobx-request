import { isPromiseWithCancel } from 'real-cancellable-promise'

import { RequestStore } from '../src/RequestStore'
import { CancelationError } from '../src/request/CancelationError'

import { delay } from './delay'

const endless = async (_: undefined, { onCancel }) => {
  let cancelled = false
  onCancel(() => {
    cancelled = true
  })
  let times = 0
  while (true) {
    if (cancelled) {
      return Promise.reject()
    }
    await delay(1)
    console.log('times', ++times)
  }
}

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

  test(`promise should be throw CancellationError when onCancel not overrided in request`, async () => {
    const funcInsidePromise = jest.fn()
    const funcAfterAwait = jest.fn()
    const funcCatch = jest.fn()

    const store = new RequestStore(async () => {
      await delay(1)
      funcInsidePromise()
      return 'some'
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

  test(`requestStore.cancel() should skip throwing error in invokation place`, () => {
    const onError = jest.fn()

    const request = new RequestStore(endless)
    void request.fetch()

    try {
      request.cancel()
    } catch (e) {
      onError(e)
    }

    expect(onError).toBeCalledTimes(0)
  })

  test(`promise.cancel() should throw error in invokation place`, () => {
    const onError = jest.fn()

    const request = new RequestStore(endless)
    const promise = request.fetch()

    try {
      promise.cancel()
    } catch (e) {
      onError(e)
    }

    expect(onError).toBeCalledTimes(0)
  })
})

export {}
