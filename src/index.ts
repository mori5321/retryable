type Retryable = <T>(limit: number, fn: () => T | Promise<T>) => RetryableReturn<T>;

export const retryable: Retryable = <T>(
  limit: number,
  fn: () => T | Promise<T>
) => {
  return retryableFn(limit, fn, undefined, undefined)
}

type RetryableReturn<T> = {
  run: Run<T>,
  if: If<T>,
  backoff: Backoff<T>,
}

type Run<T> = (count?: number) => Promise<T>;

type IfFn<T> = (result: T) => boolean;
type BackoffFn =  (count: number) => number;

type If<T> = (ifFn: IfFn<T>) => RetryableReturn<T>;
type Backoff<T> = (backoffFn: BackoffFn) => RetryableReturn<T>;

type RetryableFn = <T>(
  limit: number,
  fn: () => T | Promise<T>,
  ifFn?: IfFn<T>,
  backoffFn?: BackoffFn
) => RetryableReturn<T>

const defaultIfFn = <T>(_result: T) => true
const defaultBackoffFn: BackoffFn  = (_count) => 0

const retryableFn: RetryableFn = <T>(
  limit: number,
  fn: () => T | Promise<T>,
  ifFn: IfFn<T> = defaultIfFn,
  backoffFn = defaultBackoffFn,
) => {
  // TODO: Custom Error
  // TODO: Write Test Case
  if (limit < 0) throw new Error('limit must be greater than 0')

  const run: Run<T> = async (count = 0): Promise<T> => {
    const result = await fn()

    if (count == limit - 1) {
      return result
    }

    if (!ifFn(result)) return result

    const backoff = backoffFn(count)
    // TODO: Custom Error
    // TODO: Write Test Case
    if (backoff < 0) throw new Error('backoff must be greater than 0')
    if (backoff > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff))
    }

    return run(count + 1)
  }

  const iif: If<T> = (_ifFn: (result: T) => boolean) => {
    return retryableFn(limit, fn, _ifFn, backoffFn)
  }

  const backoff: Backoff<T> = (_backoffFn: (count: number) => number) => {
    return retryableFn(limit, fn, ifFn, _backoffFn)
  }

  return {
    run,
    if: iif,
    backoff
  }
}
