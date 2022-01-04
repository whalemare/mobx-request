import { RequestStore } from '../src/RequestStore'

describe('refreshing', () => {
  test(`should be false if not started`, () => {
    const store = new RequestStore(async () => {
      // do nothing
    })

    expect(store.isRefreshing).toBe(false)
  })

  test(`should be true when fetched with refresh`, () => {
    const store = new RequestStore(async () => {
      // do nothing
    })
    void store.fetch(undefined, { isRefresh: true })
    expect(store.isRefreshing).toBe(true)
  })

  test(`should be false when fetched with refresh ended`, async () => {
    const store = new RequestStore(async () => {
      // do nothing
    })
    await store.fetch(undefined, { isRefresh: true })
    expect(store.isRefreshing).toBe(false)
  })
})
