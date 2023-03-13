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
