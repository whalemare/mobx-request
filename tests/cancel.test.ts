import { RequestStore } from '../src/shared/RequestStore'

import { delay } from './delay'

const endless = async (_: undefined, { signal }: { signal: AbortSignal }) => {
  let times = 0
  while (true) {
    if (signal.aborted) {
      return Promise.reject()
    }
    await delay(1)
    console.log('times', ++times)
  }
}

describe(`when cancel RequestStore`, () => {
  test(`with store.cancel, signal should be true`, () => {
    const action = jest.fn(async (_, { signal }: { signal: AbortSignal }) => {
      expect(signal.aborted).toBeTruthy()
    })
    const store = new RequestStore(action)

    void store.fetch(undefined).catch(() => {
      // do nothing
    })
    store.cancel()

    expect(action).toBeCalledTimes(1)
  })

  test(`requestStore.cancel() should skip throwing error in invokation place`, async () => {
    const request = new RequestStore(endless)

    setTimeout(() => {
      const onErrorCancelInvokation = jest.fn()
      try {
        request.cancel()
      } catch (e) {
        onErrorCancelInvokation(e)
      }

      expect(onErrorCancelInvokation).not.toBeCalled()
    }, 100)

    await expect(request.fetch()).rejects.toBeTruthy()
  })
})

export {}
