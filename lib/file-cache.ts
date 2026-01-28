/**
 * File-Based Cache for Menu Data
 * Persists cache across server restarts
 * Useful for production environments
 */

import { promises as fs } from 'fs';
import path from 'path';
import { MenuData } from '@/types/menu';

interface CacheEntry {
  data: MenuData;
  timestamp: string;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

class FileCache {
  private cacheDir: string;
  private cacheLifetime: number;
  private cache: CacheStore = {};
  private loaded: boolean = false;

  constructor(cacheDir: string = '.cache', lifetimeMinutes: number = 1440) {
    this.cacheDir = path.join(process.cwd(), cacheDir);
    this.cacheLifetime = lifetimeMinutes * 60 * 1000;
  }

  /**
   * Initialize cache directory
   */
  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('[FileCache] Failed to create cache directory:', error);
    }
  }

  /**
   * Load cache from disk
   */
  private async loadCache(): Promise<void> {
    if (this.loaded) return;

    try {
      await this.ensureCacheDir();
      const cachePath = path.join(this.cacheDir, 'menu-cache.json');
      const data = await fs.readFile(cachePath, 'utf-8');
      this.cache = JSON.parse(data);
      console.log('[FileCache] Loaded cache from disk');
    } catch (error) {
      // File doesn't exist or is corrupted - start fresh
      this.cache = {};
      console.log('[FileCache] Starting with empty cache');
    }
    
    this.loaded = true;
  }

  /**
   * Save cache to disk
   */
  private async saveCache(): Promise<void> {
    try {
      await this.ensureCacheDir();
      const cachePath = path.join(this.cacheDir, 'menu-cache.json');
      await fs.writeFile(cachePath, JSON.stringify(this.cache, null, 2));
      console.log('[FileCache] Saved cache to disk');
    } catch (error) {
      console.error('[FileCache] Failed to save cache:', error);
    }
  }

  /**
   * Generate cache key
   */
  private getCacheKey(mealType: string): string {
    const today = new Date().toISOString().split('T')[0];
    return `${mealType}_${today}`;
  }

  /**
   * Check if cache entry is valid
   */
  private isValid(entry: CacheEntry): boolean {
    const now = new Date().getTime();
    const entryTime = new Date(entry.timestamp).getTime();
    return (now - entryTime) < this.cacheLifetime;
  }

  /**
   * Get cached menu data
   */
  async get(mealType: string): Promise<MenuData | null> {
    await this.loadCache();

    const key = this.getCacheKey(mealType);
    const entry = this.cache[key];

    if (!entry) {
      console.log(`[FileCache] MISS - No cache for ${mealType}`);
      return null;
    }

    if (!this.isValid(entry)) {
      console.log(`[FileCache] EXPIRED - Cache for ${mealType} expired`);
      delete this.cache[key];
      await this.saveCache();
      return null;
    }

    console.log(`[FileCache] HIT - Returning cached ${mealType}`);
    return entry.data;
  }

  /**
   * Store menu data in cache
   */
  async set(mealType: string, data: MenuData): Promise<void> {
    await this.loadCache();

    const key = this.getCacheKey(mealType);
    this.cache[key] = {
      data,
      timestamp: new Date().toISOString()
    };

    await this.saveCache();
    console.log(`[FileCache] STORED - Cached ${mealType}`);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache = {};
    await this.saveCache();
    console.log('[FileCache] CLEARED - All cache cleared');
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<void> {
    await this.loadCache();

    const keys = Object.keys(this.cache);
    let removed = 0;

    keys.forEach(key => {
      if (!this.isValid(this.cache[key])) {
        delete this.cache[key];
        removed++;
      }
    });

    if (removed > 0) {
      await this.saveCache();
      console.log(`[FileCache] CLEANUP - Removed ${removed} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    entries: number;
    keys: string[];
    size: number;
  }> {
    await this.loadCache();

    const keys = Object.keys(this.cache);
    return {
      entries: keys.length,
      keys,
      size: JSON.stringify(this.cache).length
    };
  }
}

// Export singleton instance
export const fileCache = new FileCache('.cache', 1440); // 24 hours
