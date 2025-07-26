import { MMKV } from 'react-native-mmkv';
import type { Article } from '../stores/articles';

// Platform-aware storage configuration
const createStorageConfig = (id: string) => {
  const config: any = { id };
  // Only add encryptionKey on non-web platforms
  if (typeof window === 'undefined') {
    config.encryptionKey = `dolate-${id}-key-2024`;
  }
  return config;
};

// Create separate storage instances for different data types
export const storage = new MMKV(createStorageConfig('main'));
export const articleStorage = new MMKV(createStorageConfig('articles'));
export const syncStorage = new MMKV(createStorageConfig('sync'));

// Generic storage utilities
export class MMKVStorage {
  static set(key: string, value: any, storage_instance = storage): void {
    try {
      const jsonValue = JSON.stringify(value);
      storage_instance.set(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  static get<T>(key: string, defaultValue: T, storage_instance = storage): T {
    try {
      const jsonValue = storage_instance.getString(key);
      return jsonValue ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return defaultValue;
    }
  }

  static remove(key: string, storage_instance = storage): void {
    try {
      storage_instance.delete(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }

  static clear(storage_instance = storage): void {
    try {
      storage_instance.clearAll();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  static getAllKeys(storage_instance = storage): string[] {
    try {
      return storage_instance.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }
}

// Article-specific storage utilities
export class ArticleStorage {
  private static readonly ARTICLES_KEY = 'cached_articles';
  private static readonly ARTICLE_PREFIX = 'article_';
  private static readonly LAST_SYNC_KEY = 'last_articles_sync';

  static saveArticles(articles: Article[], userId: string): void {
    const key = `${this.ARTICLES_KEY}_${userId}`;
    MMKVStorage.set(key, articles, articleStorage);
    MMKVStorage.set(`${this.LAST_SYNC_KEY}_${userId}`, Date.now(), articleStorage);
  }

  static getArticles(userId: string): Article[] {
    const key = `${this.ARTICLES_KEY}_${userId}`;
    return MMKVStorage.get(key, [], articleStorage);
  }

  static saveArticle(article: Article): void {
    const key = `${this.ARTICLE_PREFIX}${article.id}`;
    MMKVStorage.set(key, article, articleStorage);
  }

  static getArticle(articleId: string): Article | null {
    const key = `${this.ARTICLE_PREFIX}${articleId}`;
    return MMKVStorage.get(key, null, articleStorage);
  }

  static removeArticle(articleId: string): void {
    const key = `${this.ARTICLE_PREFIX}${articleId}`;
    MMKVStorage.remove(key, articleStorage);
  }

  static getLastSyncTime(userId: string): number {
    const key = `${this.LAST_SYNC_KEY}_${userId}`;
    return MMKVStorage.get(key, 0, articleStorage);
  }

  static updateArticleInCache(articleId: string, updates: Partial<Article>, userId: string): void {
    // Update in individual article cache
    const cachedArticle = this.getArticle(articleId);
    if (cachedArticle) {
      const updatedArticle = { ...cachedArticle, ...updates };
      this.saveArticle(updatedArticle);
    }

    // Update in articles list cache
    const articles = this.getArticles(userId);
    const articleIndex = articles.findIndex(a => a.id === articleId);
    if (articleIndex !== -1) {
      articles[articleIndex] = { ...articles[articleIndex], ...updates };
      this.saveArticles(articles, userId);
    }
  }

  static addArticleToCache(article: Article, userId: string): void {
    // Save individual article
    this.saveArticle(article);

    // Add to articles list
    const articles = this.getArticles(userId);
    const existingIndex = articles.findIndex(a => a.id === article.id);
    
    if (existingIndex !== -1) {
      articles[existingIndex] = article;
    } else {
      articles.unshift(article); // Add to beginning
    }
    
    this.saveArticles(articles, userId);
  }

  static removeArticleFromCache(articleId: string, userId: string): void {
    // Remove individual article
    this.removeArticle(articleId);

    // Remove from articles list
    const articles = this.getArticles(userId);
    const filteredArticles = articles.filter(a => a.id !== articleId);
    this.saveArticles(filteredArticles, userId);
  }

  static clearUserArticles(userId: string): void {
    const key = `${this.ARTICLES_KEY}_${userId}`;
    MMKVStorage.remove(key, articleStorage);
    MMKVStorage.remove(`${this.LAST_SYNC_KEY}_${userId}`, articleStorage);
    
    // Remove individual articles for this user
    const allKeys = MMKVStorage.getAllKeys(articleStorage);
    const userArticleKeys = allKeys.filter(key => 
      key.startsWith(this.ARTICLE_PREFIX) && 
      this.getArticle(key.replace(this.ARTICLE_PREFIX, ''))?.user_id === userId
    );
    
    userArticleKeys.forEach(key => {
      MMKVStorage.remove(key, articleStorage);
    });
  }
}

// Sync queue for offline operations
export class SyncQueue {
  private static readonly QUEUE_KEY = 'sync_queue';
  private static readonly FAILED_QUEUE_KEY = 'failed_sync_queue';

  static addToQueue(operation: SyncOperation): void {
    const queue = this.getQueue();
    queue.push({
      ...operation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    });
    MMKVStorage.set(this.QUEUE_KEY, queue, syncStorage);
  }

  static getQueue(): SyncOperation[] {
    return MMKVStorage.get(this.QUEUE_KEY, [], syncStorage);
  }

  static removeFromQueue(operationId: string): void {
    const queue = this.getQueue();
    const filteredQueue = queue.filter(op => op.id !== operationId);
    MMKVStorage.set(this.QUEUE_KEY, filteredQueue, syncStorage);
  }

  static moveToFailedQueue(operation: SyncOperation): void {
    const failedQueue = this.getFailedQueue();
    failedQueue.push({
      ...operation,
      retryCount: (operation.retryCount || 0) + 1,
      lastFailure: Date.now(),
    });
    MMKVStorage.set(this.FAILED_QUEUE_KEY, failedQueue, syncStorage);
    this.removeFromQueue(operation.id!);
  }

  static getFailedQueue(): SyncOperation[] {
    return MMKVStorage.get(this.FAILED_QUEUE_KEY, [], syncStorage);
  }

  static clearFailedQueue(): void {
    MMKVStorage.remove(this.FAILED_QUEUE_KEY, syncStorage);
  }

  static clearQueue(): void {
    MMKVStorage.remove(this.QUEUE_KEY, syncStorage);
  }

  static getQueueSize(): number {
    return this.getQueue().length + this.getFailedQueue().length;
  }
}

// Sync operation types
export interface SyncOperation {
  id?: string;
  type: 'create' | 'update' | 'delete';
  table: 'articles' | 'tags';
  data: any;
  userId: string;
  timestamp?: number;
  retryCount?: number;
  lastFailure?: number;
}

// Settings storage
export class SettingsStorage {
  private static readonly SETTINGS_KEY = 'app_settings';

  static getSettings(): AppSettings {
    return MMKVStorage.get(this.SETTINGS_KEY, {
      theme: 'auto',
      fontSize: 'medium',
      autoSync: true,
      offlineMode: false,
      notifications: true,
    });
  }

  static updateSettings(updates: Partial<AppSettings>): void {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    MMKVStorage.set(this.SETTINGS_KEY, newSettings);
  }

  static resetSettings(): void {
    MMKVStorage.remove(this.SETTINGS_KEY);
  }
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  autoSync: boolean;
  offlineMode: boolean;
  notifications: boolean;
}