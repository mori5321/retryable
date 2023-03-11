import { retryable } from '.'


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

        // 型を推論可能にしたい
        const result = await retryable<number>(3, fn).run()

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

        const result = await retryable(10, fn).if(n => n < 3).run()

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

        const result = await retryable(5, fn).backoff(count => Math.pow(2, count + 1) * 10).run()

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

        const result = await retryable(5, fn).if(result => result < 3).backoff(count => Math.pow(2, count + 1) * 10).run()

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

        const result = await retryable<number>(3, fn).run()

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

        const result = await retryable<number>(3, fn).if(n => n < 3).run()
        
        expect(result).toBe(3)
        expect(mockFn).toHaveBeenCalledTimes(3)
      })
    })

    describe('backoff', () => {
      it('should retry the function with backoff', async () => {
        const counter = AsyncCounter()
        const mockFn = jest.fn()

        const fn = async () => {
          mockFn()
          return await counter.increment()
        }

        const result = await retryable<number>(5, fn).backoff(count => Math.pow(2, count + 1) * 10).run()

        expect(result).toBe(5)
        expect(mockFn).toHaveBeenCalledTimes(5)
      })
    })

    describe('if & backoff', () => {
      it('should retry the function with backoff', async () => {
        const counter = AsyncCounter()
        const mockFn = jest.fn()

        const fn = async () => {
          mockFn()
          return await counter.increment()
        }

        const result = await retryable<number>(5, fn).if(result => result < 3).backoff(count => Math.pow(2, count + 1) * 10).run()

        expect(result).toBe(3)
        expect(mockFn).toHaveBeenCalledTimes(3)
      })
    })
  })

  describe('with rejectable asynchronous function', () => {
    it('should retry until Error does not occur', async () => {
      const RejectableAsyncCounter = (initialCounter = 0) => {
        let count = initialCounter

        return {
          increment: async () => {
            const promise = new Promise<number>((resolve, reject) => {
              count += 1
              if (count < 3) {
                return reject(new Error(`Count ${count} should be more than 3`))
              } else {
                return resolve(count)
              }
            })

            return promise
          }
        }
      }

      const counter = RejectableAsyncCounter()
      const mockFn = jest.fn()

      const fn = async () => {
        mockFn()
        try {
          return await counter.increment()
        } catch (e) {
          console.error((e as Error).message)
          return e as Error
        }
      }

      const result = await retryable<number | Error>(10, fn).if(val => {
        if (val instanceof Error) return true
        return false
      }).run()

      expect(result).toBe(3)
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    
    it('should keep retrying & ignore error until it satisfies the condition (val === 9)', async () => {
      const RejectableAsyncCounter = (initialCounter = 0) => {
        let count = initialCounter

        return {
          increment: async () => {
            const promise = new Promise<number>((resolve, reject) => {
              count += 1
              if (count % 2 == 0) {
                return reject(new Error(`Count ${count} should be odd number. Call increment again`))
              } else {
                return resolve(count)
              }
            })

            return promise
          }
        }
      }

      const counter = RejectableAsyncCounter()
      const mockFn = jest.fn()

      const fn = async () => {
        mockFn()
        try {
          return await counter.increment()
        } catch (e) {
          console.error((e as Error).message)
          return e as Error
        }
      }

      const result = await retryable<number | Error>(10, fn).if(val => {
        if (val instanceof Error) return true
        if (val === 9) return false
        return true
      }).run()

      expect(result).toBe(9)
      expect(mockFn).toHaveBeenCalledTimes(9)
    })
  })
})
