/**
 * Just ensure that the input is an Error instance, otherwise create new error instance depend on current
 */
export function resolveError(e: unknown): Error {
  if (e instanceof Error) {
    return e
  } else if (typeof e === 'string' || typeof e === 'number') {
    return new Error(`${e}`)
  } else {
    return new Error(`Error should be instanceof Error, but received: ${e}`)
  }
}
