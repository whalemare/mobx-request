# mobx-request

Manage async requests with no-effort

- ⚡ Efficient UI updates with MobX observables
- 🔎 [Make requests](https://github.com/whalemare/mobx-request#make-request), [refresh](https://github.com/whalemare/mobx-request#refresh-request), [track loading](https://github.com/whalemare/mobx-request#make-request), [progress](https://github.com/whalemare/mobx-request#track-progress), [cancelation](https://github.com/whalemare/mobx-request#cancel-request) and etc.
- 🧪 Well [tested](https://github.com/whalemare/mobx-request/tree/master/tests)
- 🤸‍♂️ TypeScript
- ⚛ Designed for React and MobX

## Usage

#### Make request


In simple case, you can make request with `.fetch`, display fetched `.value` and `.isLoading` state 🎉

```tsx
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
```


#### Refresh request


When user want to fetch newest available data, you allow to pass `isRefresh: true` for receive it in request

```tsx
const store = new RequestStore(async (name: string, { isRefreshing }) => {
  return service.fetchUserDetails(name, isRefreshing) // <-- receive here as isRefreshing
})

const onRefresh = () => {
  store.fetch('whalemare', {
    isRefresh: true, // <-- pass true
  })
}
```


#### Track progress


For `fire and forget` requests, you can use `isLoading` variable for display loader as described in [Make Request](https://github.com/whalemare/mobx-request#make-request)

But, when you need granular progress state tracking, you can use `progress` numeric variable

```tsx
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

```


In RequestStore you receive `onProgress` callback, that should be called with `total` and `current` values

```tsx
downloadVideo = async (uri: string, onProgress: (event: ProgressEvent) => void) => {
  for (let index = 0; index < 1000; index++) {
    await delay(1)
    onProgress({ total: 1000, current: index }) // emulate progress
  }
  return uri
}
```


If you don’t invoke `onProgress` it just will be `0` when request not started and `1` when request finished

#### Cancel request


You can cancel request at any time, when it in progress, not started or already finished by usign [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

```tsx
const store = new RequestStore(async (uri: string, { signal }) => {
  return downloadCancelableVideo(uri, signal)
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

const downloadCancelableVideo = async (uri: string, signal: AbortSignal) => {
  for (let index = 0; index < 1000; index++) {
    await delay(1)
    if (signal.aborted) {
      throw new Error(`Unable to download ${uri}, because request was be cancelled`)
    }
  }
  return uri
}
```

## Examples

#### Cancel request with axios

```tsx
import axios from 'axios'
import { RequestStore } from 'mobx-request'

new RequestStore(async (url: string, { signal }) => {
  return axios.get(url, {
    signal
  })
})
```

#### Track progress with axios

```tsx
import axios from 'axios'
import { RequestStore } from 'mobx-request'

new RequestStore(async (url: string, { onProgress }) => {
  return axios.get(url, {
    onDownloadProgress: onProgress,
    // or
    onUploadProgress: onProgress,
  })
})
```
