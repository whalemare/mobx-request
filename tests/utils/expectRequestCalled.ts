import expect from 'expect'
import { MockedEndpoint } from 'mockttp'

export async function expectRequestCalled(endpoint: MockedEndpoint, times = 1) {
  const seen = await endpoint.getSeenRequests()
  expect(seen).toHaveLength(times)
}
