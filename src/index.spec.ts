import { retryableFn } from '.'


const Counter = (initialCounter = 0) => {
  let count = initialCounter

  return {
    increment: () => {
      count += 1
      return count
    },
    get: () => count
  }
}

const AsyncCounter = (initialCounter = 0) => {
  let count = initialCounter

  return {
    increment: async () => {
      const promise = new Promise<number>(resolve => {
        count += 1
        return resolve(count)
      })

      const _count = await promise
      return _count
    }
  }
}

describe('retryable', () => {
  describe('with synchronous function', () => {
    describe('run', () => {
      it('should retry the function until it succeeds', async () => {
        const counter = Counter()
        const mockFn = jest.fn()

        const fn = () => {
          mockFn()
          return counter.increment()
        }

        const result = await retryableFn<number>(3, fn).run()

        expect(result).toBe(3)
        expect(mockFn).toHaveBeenCalledTimes(3)
      })
    })

    describe('if', () => {
      it('should retry the function until the condition is satisfied', async () => {
        const counter = Counter()
        const mockFn = jest.fn()

        const fn = (): number => {
          mockFn()
          return counter.increment()
        }

        const result = await retryableFn(10, fn).if(n => n < 3).run()

        expect(result).toEqual(3)
        expect(mockFn).toHaveBeenCalledTimes(3)
      })
    })

    describe('backoff', () => {
      it('should retry the function with backoff', async () => {
        const counter = Counter()
        const mockFn = jest.fn()

        const fn = (): number => {
          mockFn()
          return counter.increment()
        }

        const result = await retryableFn(5, fn).backoff(count => Math.pow(2, count + 1) * 10).run()

        expect(result).toEqual(5)
        expect(mockFn).toHaveBeenCalledTimes(5)
      })
    })

    describe('if & backoff', () => {
      it('should retry the function with backoff', async () => {
        const counter = Counter()
        const mockFn = jest.fn()

        const fn = (): number => {
          mockFn()
          return counter.increment()
        }

        const result = await retryableFn(5, fn).if(result => result < 3).backoff(count => Math.pow(2, count + 1) * 10).run()

        expect(result).toEqual(3)
        expect(mockFn).toHaveBeenCalledTimes(3)
      })
    })
  })
  
  describe('with asynchronous function', () => {
    describe('run', () => {
      it('should retry the function until it succeeds', async () => {
        const counter = AsyncCounter()
        const mockFn = jest.fn()

        const fn = () => {
          mockFn()
          return counter.increment()
        }

        const result = await retryableFn<number>(3, fn).run()

        expect(result).toBe(3)
        expect(mockFn).toHaveBeenCalledTimes(3)
      })
    })

    describe('if', () => {
      it('should retry the function until the condition is satisfied', async () => {
        const counter = AsyncCounter()
        const mockFn = jest.fn()

        const fn = async () => {
          mockFn()
          return await counter.increment()
        }

        const result = await retryableFn<number>(3, fn).if(n => n < 3).run()
        
        expect(result).toBe(3)
        expect(mockFn).toHaveBeenCalledTimes(3)
      })
    })
  })
})
