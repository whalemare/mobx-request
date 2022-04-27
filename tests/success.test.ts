import { RequestStore } from '../src/RequestStore'

describe('success', () => {
  test('when request not started: isSuccess = false', () => {
    expect(new RequestStore(jest.fn()).isSuccess).toBeUndefined()
  })

  test('when request started but not finished: isSuccess = null', () => {
    const request = new RequestStore(async () => {
      return new Promise(resolve => {
        setTimeout(resolve, 1)
      })
    })
    void request.fetch()
    expect(request.isSuccess).toBeNull()
  })

  test('when request finished with error: isSuccess = false', () => {
    const request = new RequestStore(async () => {
      throw new Error()
    })
    void request
      .fetch()
      .then(() => {
        throw new Error('Should not be reached')
      })
      .catch(() => {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(request.isSuccess).toBeFalsy()
      })
  })

  test('when request finished with success: isSuccess = true', () => {
    const request = new RequestStore(async () => {
      return
    })
    void request
      .fetch()
      .then(() => {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(request.isSuccess).toBeTruthy()
      })
      .catch(() => {
        throw new Error('Should not be reached')
      })
  })
})
