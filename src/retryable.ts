import { RetryLimitOutOfRangeError, BackoffOutOfRangeError } from './error'

export type Retryee<T> = {
  run: Run<T>,
  if: If<T>,
  backoff: Backoff<T>,
}

type Run<T> = (count?: number) => Promise<T>;

type IfFn<T> = (result: T) => boolean;
type BackoffFn =  (count: number) => number;

type If<T> = (ifFn: IfFn<T>) => Retryee<T>;
type Backoff<T> = (backoffFn: BackoffFn) => Retryee<T>;

type RetryeeFn = <T>(
  limit: number,
  fn: () => T | Promise<T>,
  ifFn?: IfFn<T>,
  backoffFn?: BackoffFn
) => Retryee<T>
const defaultIfFn = <T>(_result: T) => true
const defaultBackoffFn: BackoffFn  = (_count) => 0

export const retryeeFn: RetryeeFn = <T>(
  limit: number,
  fn: () => T | Promise<T>,
  ifFn: IfFn<T> = defaultIfFn,
  backoffFn = defaultBackoffFn,
) => {
  if (limit < 0) throw new RetryLimitOutOfRangeError()

  const run: Run<T> = async (count = 0): Promise<T> => {
    const backoff = backoffFn(count)
    if (backoff < 0) throw new BackoffOutOfRangeError()
    
    const result = await fn()
    
    if (count == limit - 1) {
      return result
    }

    if (!ifFn(result)) return result

    if (backoff > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff))
    }

    return run(count + 1)
  }

  const iif: If<T> = (_ifFn: (result: T) => boolean) => {
    return retryeeFn(limit, fn, _ifFn, backoffFn)
  }

  const backoff: Backoff<T> = (_backoffFn: (count: number) => number) => {
    return retryeeFn(limit, fn, ifFn, _backoffFn)
  }

  return {
    run,
    if: iif,
    backoff
  }
}
