import { request } from '../src'

import { delay } from './delay'
import { expectReaction } from './utils/expectReaction'

describe('isLoading', () => {
  let fetch = request(async () => {
    await delay(1000)
  })

  beforeEach(() => {
    fetch = request(async () => {
      await delay(1000)
    })
  })

  test('isLoading false when request not started', () => {
    expect(fetch.state.isLoading).toBe(false)
  })

  test('isLoading change is state in false-true-false when request initial-started-finished', async () => {
    await expectReaction(
      () => fetch.state.isLoading,
      [
        isLoading => expect(isLoading).toBe(false),
        isLoading => expect(isLoading).toBe(true),
        isLoading => expect(isLoading).toBe(false),
      ],
      fetch,
    )
  })

  test('reaction should not fired when you observed state', async () => {
    await expectReaction(
      () => fetch.state,
      [
        // no reaction fired
      ],
      fetch,
    )
  })
})
