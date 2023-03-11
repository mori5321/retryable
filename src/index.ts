
type Run<T> = (count?: number) => Promise<T>;
type If<T> = (condition: (result: T) => boolean) => RetryableReturn<T>;
type Backoff<T> = (backoffFn: (count: number) => number) => RetryableReturn<T>;

type RetryableFn = <T>(limit: number, fn: () => T | Promise<T>, ifFn?: (result: T) => boolean, backoffFn?: (count: number) => number) => RetryableReturn<T>

type RetryableReturn<T> = {
  run: Run<T>,
  if: If<T>,
  backoff: Backoff<T>,
}


// Interface
// retryable(3, fn).run()
// retryable(3, fn).if((result -> result === 'foo'))
// retryable(3, fn).backoff(count => count * 10).run()
// retryable(3, fn).if((result) => result === 'foo').backoff(3000).run()
// retryable(3, fn).if((result) => result === 'foo').backoff((count) => count * 10).run()
export const retryableFn: RetryableFn = <T>(
  limit: number,
  fn: () => T | Promise<T>,
  ifFn?: (result: T) => boolean,
  backoffFn?: (count: number) => number,
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
