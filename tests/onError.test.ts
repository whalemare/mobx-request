import { RequestStore } from '../src/RequestStore'

describe('onError', () => {
  test('onError should be fired when request finished with error', async () => {
    const error = new Error('error')
    const onError = jest.fn()
    const request = new RequestStore(
      async () => {
        throw error
      },
      { onError },
    )

    let requestCrashed = false
    try {
      await request.fetch()
    } catch (e) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toStrictEqual(e)
      requestCrashed = true
    }

    expect(requestCrashed).toBeTruthy()
    expect(onError).toBeCalledTimes(1)
  })
})
