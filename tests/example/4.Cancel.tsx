import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'

import { RequestStore } from '../../src/RequestStore'

import service from './UserProfileService'

const store = new RequestStore(async (uri: string, { onCancel }) => {
  return service.downloadCancelableVideo(uri, onCancel)
})

const GalleryView = observer(() => {
  useEffect(() => {
    void store.fetch('file:///video.mp4')
  }, [])

  const onPressCancel = () => {
    store.cancel()
  }

  return (
    <>
      <button onClick={onPressCancel} />
    </>
  )
})
