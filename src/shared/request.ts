import { observable, runInAction } from 'mobx'
import { resolveError } from '../internal/resolveError'

export type RequestCreator<R, A = undefined> = (args: A) => Promise<R>

interface WithState<R> {
  state: {
    isLoading: boolean
    value: R | undefined
    error: Error | undefined
  }
}

// any required for autotupe inheritance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFunction = (...args: any[]) => Promise<any>

export function request<
  Fn extends AsyncFunction,
  R extends ReturnType<Awaited<Fn>>,
  A extends Parameters<Fn>[0] = Parameters<Fn>[0],
>(creator: Fn) {
  const state = observable({
    isLoading: false,
    value: undefined as R | undefined,
    error: undefined as Error | undefined,
  })

  const requestFunction: Fn & WithState<R> = async (arg: A) => {
    runInAction(() => {
      state.isLoading = true
    })
    
    try {
      const result = await creator(arg)

      return result
    } catch(e) {
      runInAction(() => {
        state.error = resolveError(e)
      })
      throw e
    } finally {
      runInAction(() => {
        state.isLoading = false
      })
    }
  }

  // assign name to function for debug purposes
  if (creator.name) {
    Object.defineProperty(requestFunction, 'name', { value: creator.name, writable: false })
  }
  requestFunction.state = state

  return requestFunction
}
