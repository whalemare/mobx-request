import { reaction } from 'mobx'

/**
 * Check that given `expectations` will be fired when `expression` changes in specific order
 *
 * @param expression - mobx expression to observe
 * @param expectations - array of functions that will be fired when `expression` changes. 0 - initial value, 1..N - specific reactions
 * @param test - pass function to check that `expression` will be fired specific amount of times, when test ends
 */
export async function expectReaction<E extends Parameters<typeof reaction>[0]>(
  expression: E,
  expectations: ((arg: ReturnType<E>) => void)[],
  test?: () => Promise<unknown>,
) {
  let i = 0

  reaction(
    expression,
    data => {
      expectations[i](data as ReturnType<E>)
      i++
    },
    { fireImmediately: expectations.length === 0 ? false : true },
  )

  if (test) {
    await test()
    expect(i).toBe(expectations.length)
  }
}
