/* eslint-disable no-console */
import { getLocal, Mockttp } from 'mockttp'

type OnlyRequests = Pick<
  Mockttp,
  | 'forGet'
  | 'forPost'
  | 'forPut'
  | 'forPatch'
  | 'forDelete'
  | 'forHead'
  | 'forAnyRequest'
  | 'forUnmatchedRequest'
  | 'forOptions'
>

export class LocalServer {
  private readonly server: Mockttp

  isRunning = (): boolean => {
    try {
      return this.server.port !== undefined
    } catch (e) {
      // throwing error when server already started, so we catch it and return false
      return false
    }
  }

  /**
   * Mock any custom request
   */
  mock = (): OnlyRequests => {
    return this.server
  }

  getMockedEnpoints = async () => {
    return this.server.getMockedEndpoints()
  }

  start = async () => {
    await this.server.start(this.port)
    console.debug('Start server at port', this.port)
  }

  stop = async () => {
    await this.server.stop()
    console.debug('Stop server')
  }

  restart = async () => {
    try {
      await this.stop()
    } catch (e) {
      // ignore any issues with stop already stopped server
    }
    await this.start()
  }

  constructor(private port: number = 8080) {
    this.server = getLocal({
      debug: true,
      recordTraffic: true,
      suggestChanges: true,
    })
  }
}
