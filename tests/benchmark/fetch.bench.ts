import { benchmarkSuite } from 'jest-bench'

import { request, RequestStore } from '../../src'

const array: number[] = []
const asyncFunction = async () => {
  array.push(array.length)
}

benchmarkSuite('new RequestStore.fetch() vs request()', {
  ['RequestStore.fetch()']: deferred => {
    void new RequestStore(asyncFunction).fetch().then(() => deferred.resolve())
  },
  ['request()']: deferred => {
    void request(asyncFunction)().then(() => deferred.resolve())
  },
})
