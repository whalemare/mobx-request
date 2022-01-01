import { RequestStore } from '../src/RequestStore'

const delay = async (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

describe('RequestStore', () => {
  describe(`when create`, () => {
    test('should be created with plain async function', () => {
      new RequestStore(async () => {
        // nothing
      })
    })

    test('should be fetched without arguments', () => {
      const store = new RequestStore(async () => {
        // nothing
      })
      void store.fetch()
    })

    test(`should be fetcbed with plain arguments`, () => {
      const store = new RequestStore(async (count: number) => {
        return count
      })
      void store.fetch(1)
    })

    test(`should be fetcbed with object arguments`, () => {
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

  test('should unable to call private functions', async () => {
    const store = new RequestStore(jest.fn())
    await expect(async () => {
      //@ts-expect-error
      return store.onStartRequest()
    }).rejects.toBeTruthy()
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
    test(`isLoading should be true`, () => {
      const store = new RequestStore<void, undefined>(async () => {
        // do nothing
      })
      void store.fetch()
      expect(store.isLoading).toBe(true)
    })
  })
})

export {}
