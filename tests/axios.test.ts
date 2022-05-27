/* eslint-disable no-console */
/* eslint-disable jest/no-conditional-expect */
import axios from 'axios'

import { RequestStore } from '../src/RequestStore'

import { delay } from './delay'
import { LocalServer } from './utils/LocalServer'
import { expectRequestCalled } from './utils/expectRequestCalled'

describe('axios', () => {
  const server = new LocalServer(8080)

  beforeEach(async () => {
    await server.start()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('raw axios with AbortController', async () => {
    const endpoint = await server.mock().forGet('/test').thenTimeout()

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
    const endpoint = await server
      .mock()
      .forGet('/test')
      .thenCallback(async request => {
        await delay(1000)
        return {
          body: 'hello',
          statusCode: 200,
        }
      })

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
