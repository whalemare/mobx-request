/* eslint-disable no-console */
/* eslint-disable jest/no-conditional-expect */
import axios from 'axios'
import { MockedEndpoint } from 'mockttp'

import { RequestStore } from '../src/RequestStore'

import { delay } from './delay'
import { LocalServer } from './utils/LocalServer'
import { expectRequestCalled } from './utils/expectRequestCalled'

const expectNeverInvoked = () => {
  expect(true).toBeFalsy()
}

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

  test('request should be aborted with signal', async () => {
    const store = new RequestStore(async (_, { signal }) => {
      await axios(`http://localhost:8080/test`, {
        method: 'get',
        signal,
      })
    })

    store
      .fetch()
      .then(expectNeverInvoked)
      .catch(e => {
        console.log(e)
        expect(e).toBeTruthy()
      })

    await delay(50)
    store.cancel()

    await expectRequestCalled(endpoint, 1)
  })
})
