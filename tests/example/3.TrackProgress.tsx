import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'

import { RequestStore } from '../../src/RequestStore'

import service from './UserProfileService'

const store = new RequestStore(async (uri: string, { onProgress }) => {
  return service.downloadVideo(uri, onProgress)
})

const GalleryView = observer(() => {
  const percent = `${store.progress * 100}%`

  useEffect(() => {
    void store.fetch('file:///video.mp4')
  }, [])

  return <>Downloaded {percent}</>
})
