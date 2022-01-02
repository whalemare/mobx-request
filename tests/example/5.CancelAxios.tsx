import axios from 'axios'

import { RequestStore } from '../../src/RequestStore'

new RequestStore(async (uri: string, { onCancel }) => {
  const cancelable = axios.CancelToken.source()
  onCancel(cancelable.cancel)

  return axios.get('https://some.api', {
    cancelToken: cancelable.token,
  })
})
