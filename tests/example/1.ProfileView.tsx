import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'

import { RequestStore } from '../../src/RequestStore'

import service from './UserProfileService'

const store = new RequestStore(async () => {
  return service.fetchUserProfile()
})

export const ProfileView = observer(() => {
  useEffect(() => {
    void store.fetch()
  }, [])

  return (
    <>
      {store.isLoading ? 'Loading Profile...' : 'Profile'}
      {`Name: ${store.value.name}`}
    </>
  )
})
