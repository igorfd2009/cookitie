import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class LocalCache {
  private cache = new Map<string, CacheItem<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

// Global cache instance
const globalCache = new LocalCache();

// Hook for managing cached data
export function useLocalCache() {
  const [cacheVersion, setCacheVersion] = useState(0);

  const set = useCallback(<T>(key: string, data: T, ttl?: number) => {
    globalCache.set(key, data, ttl);
    setCacheVersion(v => v + 1); // Trigger re-render if needed
  }, []);

  const get = useCallback(<T>(key: string): T | null => {
    return globalCache.get<T>(key);
  }, [cacheVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const has = useCallback((key: string): boolean => {
    return globalCache.has(key);
  }, [cacheVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = useCallback((key: string): boolean => {
    const result = globalCache.delete(key);
    if (result) {
      setCacheVersion(v => v + 1);
    }
    return result;
  }, []);

  const clear = useCallback(() => {
    globalCache.clear();
    setCacheVersion(v => v + 1);
  }, []);

  // Cached fetch with automatic caching
  const cachedFetch = useCallback(async <T>(
    url: string, 
    options: RequestInit = {}, 
    ttl: number = 5 * 60 * 1000
  ): Promise<T> => {
    const cacheKey = `fetch:${url}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = globalCache.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    globalCache.set(cacheKey, data, ttl);
    setCacheVersion(v => v + 1);

    return data;
  }, []);

  // Cache with computed values
  const computeAndCache = useCallback(<T>(
    key: string,
    computeFn: () => T,
    ttl?: number
  ): T => {
    const cached = globalCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = computeFn();
    globalCache.set(key, result, ttl);
    setCacheVersion(v => v + 1);

    return result;
  }, []);

  // Effect cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't destroy global cache, just clean up this hook
      // globalCache.destroy() would be called when the app unmounts
    };
  }, []);

  return {
    set,
    get,
    has,
    remove,
    clear,
    cachedFetch,
    computeAndCache,
    cacheSize: globalCache.getSize() || 0
  };
}

// Performance monitoring hook
export function usePerformance() {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: Date.now()
  });

  useEffect(() => {
    setMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      lastRenderTime: Date.now()
    }));
  });

  const measureTime = useCallback((label: string) => {
    const start = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - start;
        console.log(`${label}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }, []);

  const measureAsync = useCallback(async <T>(
    label: string, 
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    const timer = measureTime(label);
    try {
      const result = await asyncFn();
      timer.end();
      return result;
    } catch (error) {
      timer.end();
      throw error;
    }
  }, [measureTime]);

  return {
    metrics,
    measureTime,
    measureAsync
  };
}

// Cleanup function for global cache (call this when app unmounts)
export function destroyGlobalCache(): void {
  globalCache.destroy();
}