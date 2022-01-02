export const delay = async (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout))
}
