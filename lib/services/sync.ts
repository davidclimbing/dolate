import { supabase } from '../supabase';
import { ArticleAPI } from '../api/articles';
import { SyncQueue, type SyncOperation } from '../storage/mmkv';
import { useArticleStore } from '../stores/articles';
import { useSyncStore } from '../stores/sync';
import { Config } from '../config';

export class SyncService {
  private static realtimeSubscription: any = null;
  private static syncInProgress = false;

  static async initializeRealtime(userId: string) {
    if (!Config.features.enableRealtime || this.realtimeSubscription) {
      return;
    }

    try {
      // Subscribe to article changes for the current user
      this.realtimeSubscription = supabase
        .channel('articles_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'articles',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => this.handleRealtimeUpdate(payload)
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });

      console.log('Realtime subscription initialized');
    } catch (error) {
      console.error('Error initializing realtime:', error);
    }
  }

  static cleanup() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
      console.log('Realtime subscription cleaned up');
    }
  }

  private static handleRealtimeUpdate(payload: any) {
    console.log('Realtime update received:', payload);
    
    const { eventType, new: newRecord, old: oldRecord } = payload;
    const articleStore = useArticleStore.getState();

    switch (eventType) {
      case 'INSERT':
        if (newRecord) {
          articleStore.addArticle(newRecord);
        }
        break;
      
      case 'UPDATE':
        if (newRecord) {
          articleStore.updateArticle(newRecord.id, newRecord);
        }
        break;
      
      case 'DELETE':
        if (oldRecord) {
          articleStore.removeArticle(oldRecord.id);
        }
        break;
    }
  }

  static async syncOfflineChanges(): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return false;
    }

    this.syncInProgress = true;
    const syncStore = useSyncStore.getState();
    syncStore.setSyncInProgress(true);

    try {
      const queue = SyncQueue.getQueue();
      const failedQueue = SyncQueue.getFailedQueue();
      const allOperations = [...queue, ...failedQueue];

      if (allOperations.length === 0) {
        console.log('No operations to sync');
        return true;
      }

      console.log(`Syncing ${allOperations.length} operations`);

      let successCount = 0;
      let failureCount = 0;

      // Process operations in batches
      const batchSize = 5;
      for (let i = 0; i < allOperations.length; i += batchSize) {
        const batch = allOperations.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(operation => this.processOperation(operation))
        );

        results.forEach((result, index) => {
          const operation = batch[index];
          
          if (result.status === 'fulfilled') {
            successCount++;
            SyncQueue.removeFromQueue(operation.id!);
            syncStore.decrementPendingChanges();
          } else {
            failureCount++;
            console.error(`Failed to sync operation ${operation.id}:`, result.reason);
            
            // Move to failed queue if retry limit not exceeded
            if ((operation.retryCount || 0) < 3) {
              SyncQueue.moveToFailedQueue(operation);
            } else {
              console.error(`Operation ${operation.id} exceeded retry limit, discarding`);
              SyncQueue.removeFromQueue(operation.id!);
              syncStore.decrementPendingChanges();
            }
          }
        });
      }

      console.log(`Sync completed: ${successCount} success, ${failureCount} failures`);
      syncStore.updateLastSyncTime();
      
      return failureCount === 0;

    } catch (error) {
      console.error('Error during sync:', error);
      return false;
    } finally {
      this.syncInProgress = false;
      syncStore.setSyncInProgress(false);
    }
  }

  private static async processOperation(operation: SyncOperation): Promise<void> {
    const { type, table, data, userId } = operation;

    if (table !== 'articles') {
      throw new Error(`Unsupported table: ${table}`);
    }

    switch (type) {
      case 'create':
        await ArticleAPI.createArticle(data);
        break;
      
      case 'update':
        const { id, ...updateData } = data;
        await ArticleAPI.updateArticle(id, updateData);
        break;
      
      case 'delete':
        await ArticleAPI.deleteArticle(data.id);
        break;
      
      default:
        throw new Error(`Unsupported operation type: ${type}`);
    }
  }

  static async performFullSync(userId: string): Promise<boolean> {
    try {
      const articleStore = useArticleStore.getState();
      const syncStore = useSyncStore.getState();
      
      syncStore.setSyncInProgress(true);
      
      // Sync offline changes first
      const offlineSyncSuccess = await this.syncOfflineChanges();
      
      // Then fetch latest data from server
      const serverArticles = await ArticleAPI.getArticles(userId);
      articleStore.setArticles(serverArticles);
      
      syncStore.updateLastSyncTime();
      
      console.log(`Full sync completed: ${serverArticles.length} articles`);
      
      return offlineSyncSuccess;
    } catch (error) {
      console.error('Error during full sync:', error);
      return false;
    } finally {
      const syncStore = useSyncStore.getState();
      syncStore.setSyncInProgress(false);
    }
  }

  static async syncSingleArticle(articleId: string): Promise<boolean> {
    try {
      // Check if article needs to be synced
      const queue = SyncQueue.getQueue();
      const articleOperations = queue.filter(op => 
        op.table === 'articles' && 
        (op.data.id === articleId || op.data.article_id === articleId)
      );

      if (articleOperations.length === 0) {
        return true; // Nothing to sync
      }

      // Process operations for this article
      for (const operation of articleOperations) {
        try {
          await this.processOperation(operation);
          SyncQueue.removeFromQueue(operation.id!);
          
          const syncStore = useSyncStore.getState();
          syncStore.decrementPendingChanges();
        } catch (error) {
          console.error(`Failed to sync article operation:`, error);
          SyncQueue.moveToFailedQueue(operation);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error syncing single article:', error);
      return false;
    }
  }

  static getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    // Check Supabase realtime connection status
    if (this.realtimeSubscription) {
      const state = this.realtimeSubscription.state;
      switch (state) {
        case 'joined':
          return 'connected';
        case 'joining':
          return 'connecting';
        default:
          return 'disconnected';
      }
    }
    return 'disconnected';
  }

  static async checkConflicts(userId: string): Promise<ConflictInfo[]> {
    try {
      const localArticles = useArticleStore.getState().articles;
      const serverArticles = await ArticleAPI.getArticles(userId);
      
      const conflicts: ConflictInfo[] = [];
      
      localArticles.forEach(localArticle => {
        const serverArticle = serverArticles.find(a => a.id === localArticle.id);
        if (serverArticle) {
          const localModified = new Date(localArticle.updated_at);
          const serverModified = new Date(serverArticle.updated_at);
          
          if (localModified.getTime() !== serverModified.getTime()) {
            conflicts.push({
              articleId: localArticle.id,
              localVersion: localArticle,
              serverVersion: serverArticle,
              conflictType: localModified > serverModified ? 'local_newer' : 'server_newer',
            });
          }
        }
      });
      
      return conflicts;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return [];
    }
  }
}

export interface ConflictInfo {
  articleId: string;
  localVersion: any;
  serverVersion: any;
  conflictType: 'local_newer' | 'server_newer';
}

// Background sync scheduler
export class BackgroundSync {
  private static intervalId: NodeJS.Timeout | null = null;
  private static readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static start(userId: string) {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(async () => {
      const syncStore = useSyncStore.getState();
      const articleStore = useArticleStore.getState();
      
      // Only sync if online and not already syncing
      if (!articleStore.isOffline && !syncStore.syncInProgress) {
        const queueSize = SyncQueue.getQueueSize();
        if (queueSize > 0) {
          console.log(`Background sync: ${queueSize} operations pending`);
          await SyncService.syncOfflineChanges();
        }
      }
    }, this.SYNC_INTERVAL);

    console.log('Background sync started');
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Background sync stopped');
    }
  }
}