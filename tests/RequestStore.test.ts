import { RequestStore } from '../src/RequestStore'
import { CancelationError } from '../src/request/CancelationError'

const delay = async (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

describe('RequestStore', () => {
  describe(`when create`, () => {
    test('can be created with plain async function', () => {
      new RequestStore(async () => {
        // nothing
      })
    })

    test('can be fetched without arguments', () => {
      const store = new RequestStore(async () => {
        // nothing
      })
      void store.fetch()
    })

    test(`can be fetched with plain arguments`, () => {
      const store = new RequestStore(async (count: number) => {
        return count
      })
      void store.fetch(1)
    })

    test(`can be fetched with object arguments`, () => {
      const store = new RequestStore(async (obj: { name: string }) => {
        return obj
      })
      void store.fetch({ name: 'whalemare' })
    })

    test(`should be awaitable`, async () => {
      const store = new RequestStore(async () => {
        // nothing
      })
      await store.fetch()
    })
  })

  describe(`when request not started`, () => {
    test('isLoading should be false', () => {
      const store = new RequestStore<void, undefined>(async () => {
        // do nothing
      })
      expect(store.isLoading).toBe(false)
    })
  })

  describe(`when request started`, () => {
    test(`onCancel should not be called when request not canceled`, async () => {
      const cancelHandler = jest.fn()
      const store = new RequestStore(async (_, { onCancel }) => {
        onCancel(cancelHandler)
      })
      await store.fetch()

      expect(cancelHandler).toBeCalledTimes(0)
    })

    test(`should return value when fetch`, async () => {
      const store = new RequestStore(async () => {
        return 1
      })
      const response = await store.fetch()
      expect(response).toBe(1)
    })

    test(`should receive data as first argument`, async () => {
      const store = new RequestStore(async (arg: number) => {
        return arg
      })
      const response = await store.fetch(1)
      expect(response).toBe(1)
    })

    test(`isLoading should be true`, () => {
      const store = new RequestStore<void, undefined>(async () => {
        // do nothing
      })
      void store.fetch()
      expect(store.isLoading).toBe(true)
    })

    test(`isRefreshing should be true when call refresh`, () => {
      const store = new RequestStore<void, undefined>(async () => {
        // do nothing
      })
      void store.fetch(undefined, { isRefresh: true })
      expect(store.isLoading).toBe(true)
    })
  })

  describe(`when request canceled`, () => {
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
      const func = jest.fn()
      const store = new RequestStore(async () => {
        await delay(200)
        func()
        return 4
      })
      console.log('store.fetch()')
      const promise = store.fetch()
      console.log('promise.cancel()')
      promise.cancel()
      try {
        console.log('await promise')
        const response = await promise
        console.log('response', response)
        expect(func).toBeCalledTimes(0)
      } catch (e) {
        console.log('catch e', e)
        expect(e).toBeInstanceOf(CancelationError)
      }
    })
  })

  test('should unable to call private functions', async () => {
    const store = new RequestStore(jest.fn())
    await expect(async () => {
      //@ts-expect-error
      return store.onStartRequest()
    }).rejects.toBeTruthy()
  })
})

export {}
