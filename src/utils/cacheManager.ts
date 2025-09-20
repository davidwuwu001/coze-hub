import { FeatureCardData } from '../types';

/**
 * 缓存管理器
 * 提供智能缓存机制，优化数据加载性能
 */
class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, any> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分钟默认缓存时间

  /**
   * 获取单例实例
   */
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 缓存时间（毫秒），默认5分钟
   */
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now() + ttl);
    
    // 同时保存到localStorage作为持久化缓存
    try {
      const cacheData = {
        data,
        timestamp: Date.now() + ttl,
        version: '1.0.0'
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('保存缓存到localStorage失败:', error);
    }
  }

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  get(key: string): any | null {
    // 首先检查内存缓存
    const memoryData = this.getFromMemory(key);
    if (memoryData !== null) {
      return memoryData;
    }

    // 如果内存缓存不存在或过期，检查localStorage
    return this.getFromStorage(key);
  }

  /**
   * 从内存获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  private getFromMemory(key: string): any | null {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp || Date.now() > timestamp) {
      // 缓存过期，清理
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  /**
   * 从localStorage获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  private getFromStorage(key: string): any | null {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      if (Date.now() > cacheData.timestamp) {
        // 缓存过期，清理
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      // 将有效的缓存数据加载到内存
      this.cache.set(key, cacheData.data);
      this.cacheTimestamps.set(key, cacheData.timestamp);
      
      return cacheData.data;
    } catch (error) {
      console.warn('从localStorage读取缓存失败:', error);
      return null;
    }
  }

  /**
   * 检查缓存是否存在且有效
   * @param key 缓存键
   * @returns 是否有效
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 删除指定缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
    
    // 清理localStorage中的缓存
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { memorySize: number; storageSize: number; keys: string[] } {
    const keys = Array.from(this.cache.keys());
    const storageKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    
    return {
      memorySize: this.cache.size,
      storageSize: storageKeys.length,
      keys: keys
    };
  }
}

/**
 * 卡片数据缓存管理器
 * 专门用于管理卡片数据的缓存
 */
export class CardCacheManager {
  private cacheManager = CacheManager.getInstance();
  private readonly CARDS_CACHE_KEY = 'feature_cards';
  private readonly USER_CARDS_CACHE_KEY = 'user_cards';
  private readonly CARDS_TTL = 10 * 60 * 1000; // 卡片数据缓存10分钟

  /**
   * 缓存卡片数据
   * @param cards 卡片数据
   * @param userId 用户ID（可选）
   */
  cacheCards(cards: FeatureCardData[], userId?: string): void {
    const key = userId ? `${this.USER_CARDS_CACHE_KEY}_${userId}` : this.CARDS_CACHE_KEY;
    this.cacheManager.set(key, cards, this.CARDS_TTL);
    console.log(`✅ 卡片数据已缓存，键名: ${key}, 数量: ${cards.length}`);
  }

  /**
   * 获取缓存的卡片数据
   * @param userId 用户ID（可选）
   * @returns 缓存的卡片数据或null
   */
  getCachedCards(userId?: string): FeatureCardData[] | null {
    const key = userId ? `${this.USER_CARDS_CACHE_KEY}_${userId}` : this.CARDS_CACHE_KEY;
    const cached = this.cacheManager.get(key);
    if (cached) {
      console.log(`✅ 从缓存获取卡片数据，键名: ${key}, 数量: ${cached.length}`);
    }
    return cached;
  }

  /**
   * 检查卡片缓存是否有效
   * @param userId 用户ID（可选）
   * @returns 是否有有效缓存
   */
  hasValidCache(userId?: string): boolean {
    const key = userId ? `${this.USER_CARDS_CACHE_KEY}_${userId}` : this.CARDS_CACHE_KEY;
    return this.cacheManager.has(key);
  }

  /**
   * 清除卡片缓存
   * @param userId 用户ID（可选）
   */
  clearCardsCache(userId?: string): void {
    const key = userId ? `${this.USER_CARDS_CACHE_KEY}_${userId}` : this.CARDS_CACHE_KEY;
    this.cacheManager.delete(key);
    console.log(`🗑️ 已清除卡片缓存，键名: ${key}`);
  }

  /**
   * 清除所有卡片相关缓存
   */
  clearAllCardsCache(): void {
    const stats = this.cacheManager.getStats();
    stats.keys.forEach(key => {
      if (key.includes('cards')) {
        this.cacheManager.delete(key);
      }
    });
    console.log('🗑️ 已清除所有卡片相关缓存');
  }
}

// 导出单例实例
export const cacheManager = CacheManager.getInstance();
export const cardCacheManager = new CardCacheManager();