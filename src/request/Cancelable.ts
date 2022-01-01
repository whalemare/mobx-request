export interface Cancelable<R = void> {
  cancel(): R
}
