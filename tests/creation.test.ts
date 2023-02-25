import { RequestStore } from '../src/shared/RequestStore'
import { request } from '../src/index'

describe('when create request', () => {
  test('async function without arguments', () => {
    request(async () => {
      // nothing
    })
  })

  test('can be invoked without arguments', () => {
    const fetch = request(async () => {
      // nothing
    })
    void fetch()
  })

  test(`can be invoked with number`, () => {
    const fetch = request(async (count: number) => {
      return count
    })
    void fetch(1)
  })

  test(`can be invoked only with specified type in args`, () => {
    const fetch = request(async (count: number) => {
      return count
    })
    // expected number, not string
    // @ts-expect-error
    void fetch('string')
  })

  test(`when arguments specified it required`, () => {
    const fetch = request(async (count: number) => {
      return count
    })
    // we specify arguments, so TS should throw error when client call function without arguments
    // @ts-expect-error
    void fetch()
  })

  test(`allow object complex arguments`, () => {
    const fetch = request(async (object: {name: string}) => {
      return object
    })
    void fetch({ name: 'whalemare' })
  })

  test(`return type infered`, async () => {
    const fetch = request(async (count: number) => {
      return count
    })
    const result = await fetch(4)
    
    result satisfies number

    // @ts-expect-error
    result satisfies string
  })

  test(`allow return void`, async () => {
    const fetch = request(async (count: number) => {
      return
    })
    const result = await fetch(4)
    
    result satisfies void
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
