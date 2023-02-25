import { observable } from 'mobx'

export type RequestCreator<R, A = undefined> = (args: A) => Promise<R>

type WithOptionalArgs<A, R> = A extends undefined
  ? (noArgs?: undefined) => Promise<R>
  : A extends never
  ? () => Promise<R>
  : (arg: A) => Promise<R>

interface RequestFunction<R> {
  state: {
    isLoading: boolean
    value: R | undefined
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
  })

  const requestFunction: Fn = async (arg: A) => {
    return creator(arg)
  }

  // assign name to function for debug purposes
  if (creator.name) {
    Object.defineProperty(requestFunction, 'name', { value: creator.name, writable: false })
  }
  requestFunction.state = state

  return requestFunction
}
