
type Retryee<T> = {
  run: Run<T>,
  if: If<T>,
  backoff: Backoff<T>,
}

export const retryee = <T>(
  limit: number,
  fn: () => T | Promise<T>
) => {
  return retryeeFn(limit, fn, undefined, undefined)
}

export const exponentialBackoff = (base: number) => (count: number) => Math.pow(2, count + 1) * base


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

const retryeeFn: RetryeeFn = <T>(
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


type ErrorMap = {
  [key: string]: {
    name: string,
    code: string,
    message: string,
  }
}

const errorMap: ErrorMap = {
  RetryLimitOutOfRangeError: {
    name: 'RetryLimitOutOfRangeError',
    code: 'rt-001',
    message: 'Retry limit must be greater than 0',
  },
  BackoffOutOfRangeError: {
    name: 'BackoffOutOfRangeError',
    code: 'rt-002',
    message: 'Backoff must be greater than 0',
  }
}

export class RetryLimitOutOfRangeError extends Error {
  private readonly _code: string

  constructor() {
    super()
    const error = errorMap.RetryLimitOutOfRangeError
    this.name = error.name
    this._code = error.code
    this.message = error.message
  }

  code = (): string => this._code
}

export class BackoffOutOfRangeError extends Error {
  private readonly _code: string

  constructor() {
    super()
    const error = errorMap.BackoffOutOfRangeError
    this.name = error.name
    this._code = error.code
    this.message = error.message
  }
  
  code = (): string => this._code
}
