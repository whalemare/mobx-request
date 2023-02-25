import { autorun } from "mobx"
import { request } from "../src"
import { delay } from "./delay"

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

  test('isLoading true when request started but not finished', async () => {
    const runs = [
      (value: boolean) => expect(value).toBe(false),
      (value: boolean) => expect(value).toBe(true),
      (value: boolean) => expect(value).toBe(false),
    ]
    let i = 0
    autorun(() => {
      console.log('fetch.state.isLoading', fetch.state.isLoading)
      runs[i](fetch.state.isLoading)
      i++
    })

    await fetch()
    expect(i).toBe(runs.length)
  })
})