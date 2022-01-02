import { ProgressEvent } from '../../src/request/ProgressEvent'
import { delay } from '../delay'

class UserProfileService {
  fetchUserProfile = async () => {
    await delay(1000)
    return {
      name: `whalemare`,
    }
  }

  fetchUserDetails = async (name: string, force: boolean) => {
    await delay(1000)
    return {
      name: name,
      force: force,
    }
  }

  downloadVideo = async (uri: string, onProgress: (event: ProgressEvent) => void) => {
    for (let index = 0; index < 1000; index++) {
      await delay(1)
      onProgress({ total: 1000, current: index }) // emulate progress
    }
    return uri
  }

  downloadCancelableVideo = async (uri: string, onCancel: (cancelHandler: () => void) => void) => {
    let cancelled = false
    onCancel(() => {
      cancelled = true
    })
    for (let index = 0; index < 1000; index++) {
      await delay(1)
      if (cancelled) {
        throw new Error(`Unable to download ${uri}, because request was be cancelled`)
      }
    }
    return uri
  }
}
const service = new UserProfileService()
export default service
