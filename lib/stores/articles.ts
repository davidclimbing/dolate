import { create } from 'zustand';
import { Database } from '../supabase';

// Lazy imports for SSR compatibility
let NetInfo: any, ArticleStorage: any, SyncQueue: any, SyncService: any;

// Import these only in browser environment
if (typeof window !== 'undefined') {
  import('@react-native-community/netinfo').then(module => {
    NetInfo = module.default;
  });
  
  import('../storage/mmkv').then(module => {
    ArticleStorage = module.ArticleStorage;
    SyncQueue = module.SyncQueue;
  });
  
  import('../services/sync').then(module => {
    SyncService = module.SyncService;
  });
}

export type Article = Database['public']['Tables']['articles']['Row'];
export type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
export type ArticleUpdate = Database['public']['Tables']['articles']['Update'];

interface ArticleState {
  articles: Article[];
  loading: boolean;
  searchQuery: string;
  selectedTags: string[];
  showUnreadOnly: boolean;
  showFavoritesOnly: boolean;
  isOffline: boolean;
  lastSyncTime: number | null;
}

interface ArticleActions {
  setArticles: (articles: Article[]) => void;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  removeArticle: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleUnreadOnly: () => void;
  toggleFavoritesOnly: () => void;
  getFilteredArticles: () => Article[];
  markAsRead: (id: string) => void;
  toggleFavorite: (id: string) => void;
  loadFromCache: (userId: string) => void;
  syncOfflineChanges: () => Promise<void>;
  setOfflineStatus: (isOffline: boolean) => void;
  initializeNetworkMonitoring: () => void;
}

export const useArticleStore = create<ArticleState & ArticleActions>((set, get) => ({
  articles: [],
  loading: false,
  searchQuery: '',
  selectedTags: [],
  showUnreadOnly: false,
  showFavoritesOnly: false,
  isOffline: false,
  lastSyncTime: null,

  setArticles: (articles) => {
    set({ articles, lastSyncTime: Date.now() });
    // Cache articles for offline access
    if (articles.length > 0 && articles[0]?.user_id) {
      if (ArticleStorage && articles.length > 0) {
        ArticleStorage.saveArticles(articles, articles[0].user_id);
      }
    }
  },

  addArticle: (article) => {
    set((state) => ({ 
      articles: [article, ...state.articles] 
    }));
    // Cache new article
    ArticleStorage.addArticleToCache(article, article.user_id);
  },

  updateArticle: (id, updates) => {
    const { articles, isOffline } = get();
    const article = articles.find(a => a.id === id);
    
    set((state) => ({
      articles: state.articles.map((article) =>
        article.id === id ? { ...article, ...updates, updated_at: new Date().toISOString() } : article
      ),
    }));
    
    if (article) {
      // Cache the update
      ArticleStorage.updateArticleInCache(id, { ...updates, updated_at: new Date().toISOString() }, article.user_id);
      
      // Queue for sync if offline
      if (isOffline) {
        SyncQueue.addToQueue({
          type: 'update',
          table: 'articles',
          data: { id, ...updates },
          userId: article.user_id,
        });
      }
    }
  },

  removeArticle: (id) => {
    const { articles, isOffline } = get();
    const article = articles.find(a => a.id === id);
    
    set((state) => ({
      articles: state.articles.filter((article) => article.id !== id),
    }));
    
    if (article) {
      // Remove from cache
      ArticleStorage.removeArticleFromCache(id, article.user_id);
      
      // Queue for sync if offline
      if (isOffline) {
        SyncQueue.addToQueue({
          type: 'delete',
          table: 'articles',
          data: { id },
          userId: article.user_id,
        });
      }
    }
  },

  setLoading: (loading) => set({ loading }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSelectedTags: (selectedTags) => set({ selectedTags }),

  toggleUnreadOnly: () => 
    set((state) => ({ showUnreadOnly: !state.showUnreadOnly })),

  toggleFavoritesOnly: () => 
    set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly })),

  markAsRead: (id) => 
    get().updateArticle(id, { is_read: true }),

  toggleFavorite: (id) => {
    const article = get().articles.find((a) => a.id === id);
    if (article) {
      get().updateArticle(id, { is_favorite: !article.is_favorite });
    }
  },

  loadFromCache: (userId) => {
    const cachedArticles = ArticleStorage.getArticles(userId);
    const lastSyncTime = ArticleStorage.getLastSyncTime(userId);
    set({ articles: cachedArticles, lastSyncTime });
  },

  syncOfflineChanges: async () => {
    try {
      const success = await SyncService.syncOfflineChanges();
      if (success) {
        console.log('All offline changes synced successfully');
      } else {
        console.log('Some offline changes failed to sync');
      }
      return success;
    } catch (error) {
      console.error('Error syncing offline changes:', error);
      return false;
    }
  },

  setOfflineStatus: (isOffline) => {
    set({ isOffline });
  },

  initializeNetworkMonitoring: () => {
    NetInfo.addEventListener((state: any) => {
      const isOffline = !state.isConnected;
      get().setOfflineStatus(isOffline);
      
      // Sync when coming back online
      if (!isOffline && SyncQueue.getQueueSize() > 0) {
        get().syncOfflineChanges();
      }
    });
  },

  getFilteredArticles: () => {
    const { 
      articles, 
      searchQuery, 
      selectedTags, 
      showUnreadOnly, 
      showFavoritesOnly 
    } = get();

    return articles.filter((article) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          article.title.toLowerCase().includes(query) ||
          article.description?.toLowerCase().includes(query) ||
          article.domain.toLowerCase().includes(query) ||
          article.author?.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some((tag) =>
          article.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Unread filter
      if (showUnreadOnly && article.is_read) {
        return false;
      }

      // Favorites filter
      if (showFavoritesOnly && !article.is_favorite) {
        return false;
      }

      return true;
    });
  },
}));