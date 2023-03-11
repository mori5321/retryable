
type Run<T> = (count?: number, condition?: (result: T) => boolean, backoff?: (count: number) => number) => Promise<T>;
type If<T> = (condition: (result: T) => boolean) => Runnable<T>;

type Runnable<T> = {
  run: Run<T>
}

type RetryableFn = <T>(limit: number, fn: () => T | Promise<T>) => {
  run: Run<T>
  if: If<T>
}


export const retryableFn: RetryableFn = <T>(limit: number, fn: () => T | Promise<T>) => {
  const run: Run<T> = async (count = 0, condition = undefined, _backoffFn = undefined): Promise<T> => {
    const _result = fn()
    let result: T

    if (_result instanceof Promise) {
      console.log('is promise')
      result = await _result
    } else {
      result = _result
    }


    // count, limit
    // 0, 3
    // 1, 3
    // 2, 3
    // 3, 3

    if (count == limit - 1) {
      return result
    }

    if (condition) {
      const b = condition(result)
      if (!b) return result
    }

    // if (backoffFn) {
    //   const backoff = backoffFn(count)
    //   await new Promise(resolve => setTimeout(resolve, backoff))
    // }
    //
    return run(count + 1, condition)
  }

  const ifCondition: If<T> = (condition: (result: T) => boolean): Runnable<T> => {
    const _run = async (count = 0): Promise<T> => {
      return run(count, condition, undefined)
    }

    return {
      run: _run
    }
  }

  return {
    run,
    if: ifCondition,
  }
}


// Interface
// 
// retryable(3, fn).run()
// retryable(3, fn).if((result -> result === 'foo'))
// retryable(3, fn).backoff(count => count * 10).run()
// retryable(3, fn).if((result) => result === 'foo').backoff(3000).run()
// retryable(3, fn).if((result) => result === 'foo').backoff((count) => count * 10).run()
// 
