export interface Errorable<E extends Error = Error> {
  error: E | undefined
}
