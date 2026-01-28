/**
 * In-Memory Cache for Menu Data
 * Stores menu data with timestamps to avoid repeated scraping
 */

import { MenuData } from '@/types/menu';

interface CacheEntry {
  data: MenuData;
  timestamp: Date;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

class MenuCache {
  private cache: CacheStore = {};
  private cacheLifetime: number;

  constructor(lifetimeMinutes: number = 1440) { // Default: 24 hours (1440 minutes)
    this.cacheLifetime = lifetimeMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Generate cache key from meal type and date
   */
  private getCacheKey(mealType: string): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${mealType}_${today}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    const now = new Date().getTime();
    const entryTime = entry.timestamp.getTime();
    return (now - entryTime) < this.cacheLifetime;
  }

  /**
   * Get cached menu data if available and valid
   */
  get(mealType: string): MenuData | null {
    const key = this.getCacheKey(mealType);
    const entry = this.cache[key];

    if (!entry) {
      console.log(`[Cache] MISS - No cache for ${mealType}`);
      return null;
    }

    if (!this.isValid(entry)) {
      console.log(`[Cache] EXPIRED - Cache for ${mealType} expired`);
      delete this.cache[key];
      return null;
    }

    console.log(`[Cache] HIT - Returning cached ${mealType}`);
    return entry.data;
  }

  /**
   * Store menu data in cache
   */
  set(mealType: string, data: MenuData): void {
    const key = this.getCacheKey(mealType);
    this.cache[key] = {
      data,
      timestamp: new Date()
    };
    console.log(`[Cache] STORED - Cached ${mealType} for today`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache = {};
    console.log('[Cache] CLEARED - All cache cleared');
  }

  /**
   * Remove expired entries (cleanup)
   */
  cleanup(): void {
    const keys = Object.keys(this.cache);
    let removed = 0;

    keys.forEach(key => {
      if (!this.isValid(this.cache[key])) {
        delete this.cache[key];
        removed++;
      }
    });

    if (removed > 0) {
      console.log(`[Cache] CLEANUP - Removed ${removed} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { 
    entries: number; 
    keys: string[];
    size: number;
  } {
    const keys = Object.keys(this.cache);
    return {
      entries: keys.length,
      keys,
      size: JSON.stringify(this.cache).length
    };
  }
}

// Export singleton instance
export const menuCache = new MenuCache(1440); // 24 hours

// Run cleanup every hour (only in server environment)
if (typeof window === 'undefined' && typeof setInterval !== 'undefined') {
  setInterval(() => {
    menuCache.cleanup();
  }, 60 * 60 * 1000); // Every hour
}
