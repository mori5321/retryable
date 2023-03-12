# @mori5321/retryee
`retryee` is a flexible library for Node.js that enables evelopers to easily add retry logic to their code.
With `retryee`, you can specify how many times to retry, how long to wait between retries, and what errors to catch in a customizable way. 

## Installation
To install `retryee`, run:

```
npm install retryee
```

## Usage
Here's an simplest example of using `retryee` with `fetch`:

```typescript
import { retryee, exponentialBackoff } from 'retryee'

// - retry 5 times
// - with exponentialBackoff (0sec -> 1000ms -> 2000ms -> 4000ms -> 8000ms)
// - retry if response is 5xx Error
const fetchWithRetry = async (url: string) => {
  return await retryee(5, () => fetch(url))
    .if((response) => response.status >= 500)
    .backoff(exponentialBackoff(1000))
    .run()
}
```

If you want to customize backoff, you can:
```typescript
import { retryee, exponentialBackoff } from 'retryee'

// retry 3 times with backoff(count * 100), that is 0ms -> 2000ms -> 4000ms -> 6000ms -> 8000ms
const fetchWithRetry = async (url: string) => {
  return await retryee(5, () => fetch(url))
    .if((result) => result.status >= 500)
    .backoff((count) => count * 2000)
    .run()
```
