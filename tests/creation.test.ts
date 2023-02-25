import { RequestStore } from '../src/RequestStore'
import { request } from '../src/index'

describe('when create request', () => {
  test('async function without arguments', () => {
    request(async () => {
      // nothing
    })
  })

  test('can be invoked without arguments', () => {
    const myRequest = request(async () => {
      // nothing
    })
    void myRequest()
  })

  test(`can be invoked with number`, () => {
    const store = request(async (count: number) => {
      return count
    })
    void store(1)
  })

  test(`can be invoked only with specified type in args`, () => {
    const store = request(async (count: number) => {
      return count
    })
    // expected number, not string
    // @ts-expect-error
    void store('string')
  })

  test(`when arguments specified it required`, () => {
    const store = request(async (count: number) => {
      return count
    })
    // we specify arguments, so TS should throw error when client call function without arguments
    // @ts-expect-error
    void store()
  })
})

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
