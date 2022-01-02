import axios from 'axios'

import { RequestStore } from '../../src/RequestStore'

new RequestStore(async (url: string, { onProgress }) => {
  return axios.get(url, {
    onDownloadProgress: onProgress,
    // or
    onUploadProgress: onProgress,
  })
})
