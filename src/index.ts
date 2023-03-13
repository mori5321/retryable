import { retryeeFn } from './retryeeFn'

export { RetryLimitOutOfRangeError, BackoffOutOfRangeError } from './error'

export const retryee = <T>(
  limit: number,
  fn: () => T | Promise<T>
) => {
  return retryeeFn(limit, fn, undefined, undefined)
}

export const exponentialBackoff = (base: number) => (count: number) => Math.pow(2, count + 1) * base
