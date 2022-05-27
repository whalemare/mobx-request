import { RequestStore } from '../src/RequestStore'

describe(`when fetch RequestStore`, () => {
  test(`signal.aborted should be false, when request not canceled`, async () => {
    const cancelHandler = jest.fn()
    const store = new RequestStore(async (_, { signal }) => {
      expect(signal.aborted).toBeFalsy()
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

export {}
