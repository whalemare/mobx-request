/* eslint-disable no-console */
/* eslint-disable jest/no-conditional-expect */
import axios from 'axios'
import { MockedEndpoint } from 'mockttp'

import { RequestStore } from '../src/RequestStore'

import { delay } from './delay'
import { LocalServer } from './utils/LocalServer'
import { expectRequestCalled } from './utils/expectRequestCalled'

describe('axios', () => {
  const server = new LocalServer(8080)
  let endpoint: MockedEndpoint

  beforeEach(async () => {
    await server.start()
    endpoint = await server.mock().forGet('/test').thenTimeout()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('raw axios with AbortController', async () => {
    const abort = new AbortController()
    const func = async () => {
      await axios(`http://localhost:8080/test`, {
        method: 'get',
        signal: abort.signal,
      })
    }

    void func()
      .then(() => {
        expect(true).toBeFalsy()
      })
      .catch(e => {
        console.log(e)
        expect(e).toBeTruthy()
      })

    await delay(50)
    abort.abort()
    await expectRequestCalled(endpoint, 1)
  })

  test('axios with AbortController', async () => {
    const store = new RequestStore(async (_, { onCancel }) => {
      const abort = new AbortController()
      onCancel(abort.abort)

      await axios(`http://localhost:8080/test`, {
        method: 'get',
        signal: abort.signal,
      })
    })

    const promise = store.fetch()
    await delay(50)
    try {
      store.cancel()
    } catch (e) {}

    await expectRequestCalled(endpoint, 1)
    await expect(promise).rejects.toBeTruthy()
  })
})
