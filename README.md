This library is still in alpha(0.0.x) version. Please consider when you use it in production. 

# retryee
`retryee` is a programmable library for retry. 
This is written in TypeScript. It enables developers to customize retry & backoff in a simple way.
With `retryee`, you can specify how many times to retry, how long to wait between retries, and what errors to catch in a programable way. 

## Installation
To install `retryee`, run:

```
npm install retryee
```

## Usage
Here's an simplest example of using `retryee` with `fetch`:

### Basic Example
```typescript
import { retryee, exponentialBackoff } from 'retryee'

// - retry 5 times
// - with exponentialBackoff (0sec -> 1000ms -> 2000ms -> 4000ms -> 8000ms)
// - retry if response returns 5xx Error
const fetchWithRetry = async (url: string) => {
  return await retryee(5, () => fetch(url))
    .if((response) => response.status >= 500)
    .backoff(exponentialBackoff(1000))
    .run()
}
```

### Customize Backoff
If you want to customize backoff, you can write code like:
```typescript
import { retryee } from 'retryee'

// retry 5 times
// with custom backoff(count * 100, that is 0ms -> 2000ms -> 4000ms -> 6000ms -> 8000ms)
const fetchWithRetry = async (url: string) => {
  return await retryee(5, () => fetch(url))
    .if((result) => result.status >= 500)
    .backoff((count) => count * 2000)
    .run()
}

const fetchWithRetry = async (url: string) => {
  return await retryee(5, () => fetch(url))
    .if((result) => result.status >= 500)
    .backoff((count) => count * 2000)
    .run()
}
```

### Catch Exception
If you want to catch exception, you can write code like this:
``` typescript
// - retry if it throws error OR response returns 5xx Error.
const fetchWithRetry = async (url: string) => {
  return await retryee(5, async () => {
    try {
      const result = await fetch(url)
      return result;
    } catch (e) {
      if (e instanceof Error) return e
      if (typeof e === 'string') return new Error(e)
      return new Error(`Unknown Error: ${e}`)
    }
  )
  .if((result) => {
    if (result instanceof Error) return true;
    if (result?.status >= 500) return true;
    return false;
  })
  .backoff(exponentialBackoff(1000))
  .run()
}
```
