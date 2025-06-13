import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class FileCache<T> {
  private cacheDir: string;

  constructor(cacheDir: string = '.cache') {
    this.cacheDir = join(process.cwd(), cacheDir);
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.access(this.cacheDir);
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  private generateKey(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  private getFilePath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
  }

  async get(key: string): Promise<T | null> {
    try {
      await this.ensureCacheDir();
      const filePath = this.getFilePath(this.generateKey(key));
      const data = await fs.readFile(filePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(data);

      // Check if entry is expired
      if (Date.now() > entry.timestamp + entry.ttl) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }

  async set(key: string, value: T, ttlMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      await this.ensureCacheDir();
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttlMs,
      };

      const filePath = this.getFilePath(this.generateKey(key));
      await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.warn('Failed to write cache entry:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(this.generateKey(key));
      await fs.unlink(filePath);
    } catch {
      // Ignore errors when deleting non-existent files
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(join(this.cacheDir, file)))
      );
    } catch {
      // Ignore errors when clearing cache
    }
  }
}
