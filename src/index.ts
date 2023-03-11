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

const retryableFn: RetryableFn = <T>(
  limit: number,
  fn: () => T | Promise<T>,
  ifFn: IfFn<T> | undefined,
  backoffFn: BackoffFn | undefined,
) => {
  const run: Run<T> = async (count = 0): Promise<T> => {
    const _result = fn()
    let result: T

    if (_result instanceof Promise) {
      result = await _result
    } else {
      result = _result
    }

    if (count == limit - 1) {
      return result
    }

    if (ifFn) {
      const b = ifFn(result)
      if (!b) return result
    }

    if (backoffFn) {
      const backoff = backoffFn(count)
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
