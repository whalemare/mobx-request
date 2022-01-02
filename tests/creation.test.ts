import { RequestStore } from '../src/RequestStore'

describe(`when create RequestStore`, () => {
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

export {}
