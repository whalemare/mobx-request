import { RequestStore } from '../src/RequestStore'

describe('RequestStore', () => {
  describe(`when request not started`, () => {
    test('isLoading should be false', () => {
      const store = new RequestStore<void, undefined>(async () => {
        // do nothing
      })
      expect(store.isLoading).toBe(false)
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
