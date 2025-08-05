/**
 * Async Utilities
 * Promise-based utilities for asynchronous operations
 */

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a promise-returning function with exponential backoff
 */
export async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = () => true
  } = options;

  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
        throw error;
      }
      
      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Create a timeout promise that rejects after specified time
 */
export function timeout(ms, message = 'Operation timed out') {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Race a promise against a timeout
 */
export function withTimeout(promise, ms, message = 'Operation timed out') {
  return Promise.race([
    promise,
    timeout(ms, message)
  ]);
}

/**
 * Create a debounced version of an async function
 */
export function debounceAsync(fn, delay = 250) {
  let timeoutId;
  let resolveQueue = [];
  let rejectQueue = [];
  
  return function(...args) {
    return new Promise((resolve, reject) => {
      // Add to queues
      resolveQueue.push(resolve);
      rejectQueue.push(reject);
      
      // Clear previous timeout
      clearTimeout(timeoutId);
      
      // Set new timeout
      timeoutId = setTimeout(async () => {
        const currentResolvers = [...resolveQueue];
        const currentRejecters = [...rejectQueue];
        
        // Clear queues
        resolveQueue = [];
        rejectQueue = [];
        
        try {
          const result = await fn.apply(this, args);
          currentResolvers.forEach(resolve => resolve(result));
        } catch (error) {
          currentRejecters.forEach(reject => reject(error));
        }
      }, delay);
    });
  };
}

/**
 * Create a throttled version of an async function
 */
export function throttleAsync(fn, delay = 250) {
  let isThrottled = false;
  let lastResult;
  let lastError;
  let pendingPromises = [];
  
  return function(...args) {
    return new Promise((resolve, reject) => {
      if (isThrottled) {
        // Return last result/error or queue the promise
        if (lastResult !== undefined) {
          resolve(lastResult);
        } else if (lastError !== undefined) {
          reject(lastError);
        } else {
          pendingPromises.push({ resolve, reject });
        }
        return;
      }
      
      isThrottled = true;
      lastResult = undefined;
      lastError = undefined;
      
      fn.apply(this, args)
        .then(result => {
          lastResult = result;
          resolve(result);
          
          // Resolve pending promises
          pendingPromises.forEach(({ resolve }) => resolve(result));
          pendingPromises = [];
          
          setTimeout(() => {
            isThrottled = false;
            lastResult = undefined;
          }, delay);
        })
        .catch(error => {
          lastError = error;
          reject(error);
          
          // Reject pending promises
          pendingPromises.forEach(({ reject }) => reject(error));
          pendingPromises = [];
          
          setTimeout(() => {
            isThrottled = false;
            lastError = undefined;
          }, delay);
        });
    });
  };
}

/**
 * Process items in batches with delay between batches
 */
export async function processBatches(items, batchSize, processor, delayBetweenBatches = 0) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    // Delay between batches if specified
    if (delayBetweenBatches > 0 && i + batchSize < items.length) {
      await sleep(delayBetweenBatches);
    }
  }
  
  return results;
}

/**
 * Create a promise that resolves when a condition becomes true
 */
export function waitForCondition(condition, options = {}) {
  const { 
    timeout: timeoutMs = 5000, 
    interval = 100, 
    message = 'Condition not met within timeout' 
  } = options;
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function check() {
      try {
        if (condition()) {
          resolve();
          return;
        }
      } catch (error) {
        reject(error);
        return;
      }
      
      if (Date.now() - startTime >= timeoutMs) {
        reject(new Error(message));
        return;
      }
      
      setTimeout(check, interval);
    }
    
    check();
  });
}

/**
 * Create a cancelable promise
 */
export function createCancelablePromise(executor) {
  let isCanceled = false;
  let cancelReason;
  
  const promise = new Promise((resolve, reject) => {
    executor(
      (value) => {
        if (!isCanceled) resolve(value);
      },
      (reason) => {
        if (!isCanceled) reject(reason);
      },
      () => isCanceled
    );
  });
  
  return {
    promise,
    cancel(reason = 'Promise was canceled') {
      isCanceled = true;
      cancelReason = reason;
    },
    isCanceled() {
      return isCanceled;
    },
    cancelReason() {
      return cancelReason;
    }
  };
}

export default {
  sleep,
  retry,
  timeout,
  withTimeout,
  debounceAsync,
  throttleAsync,
  processBatches,
  waitForCondition,
  createCancelablePromise
};