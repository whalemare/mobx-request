import { reaction } from 'mobx'

import { RequestStore } from '../src/RequestStore'

describe('progress', () => {
  test(`should be 0 when not started`, () => {
    const store = new RequestStore(jest.fn())
    expect(store.progress).toBe(0)
  })

  test(`should be 0 when rejected`, async () => {
    const store = new RequestStore(async () => {
      throw new Error()
    })
    try {
      await store.fetch()
    } catch (e) {
      // do nothing
    } finally {
      expect(store.progress).toBe(0)
    }
  })

  test(`should be 1 when resolve`, async () => {
    const store = new RequestStore(async () => {
      // do nothing
    })
    await store.fetch()
    expect(store.progress).toBe(1)
  })

  test(`onProgress should change progress`, async () => {
    const values = [0, 0, 0, 0, 0]
    const progressFunc = jest.fn()
    const store = new RequestStore(async (_, { onProgress }) => {
      return new Promise(resolve => {
        values.forEach((value, index) => {
          setTimeout(() => {
            onProgress({
              loaded: index,
              total: values.length,
            })
            if (index === values.length - 1) {
              resolve(0)
            }
          }, 100 * index)
        })
      })
      // do nothing
    })
    reaction(
      () => store.progress,
      progress => {
        progressFunc(progress)
      },
    )
    await store.fetch()
    expect(progressFunc).toBeCalledTimes(values.length)
  })
})
