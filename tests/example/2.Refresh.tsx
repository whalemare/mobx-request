/* eslint-disable unused-imports/no-unused-vars */
import { RequestStore } from '../../src/RequestStore'

import service from './UserProfileService'

const store = new RequestStore(async (name: string, { isRefreshing }) => {
  return service.fetchUserDetails(name, isRefreshing)
})

const onRefresh = () => {
  return store.fetch('whalemare', {
    isRefresh: true,
  })
}
