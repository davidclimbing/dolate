import { create } from 'zustand';
import type { Article } from './articles';
import { demoArticles, demoTags, DEMO_USER_ID } from '@/lib/data/demo-data';

interface DemoState {
  isDemo: boolean;
  demoUser: {
    id: string;
    email: string;
    name: string;
  };
  articles: Article[];
  tags: string[];
}

interface DemoActions {
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  addDemoArticle: (article: Omit<Article, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateDemoArticle: (id: string, updates: Partial<Article>) => void;
  deleteDemoArticle: (id: string) => void;
  toggleDemoFavorite: (id: string) => void;
  markDemoAsRead: (id: string) => void;
  searchDemoArticles: (query: string) => Article[];
  getDemoArticleById: (id: string) => Article | undefined;
}

export const useDemoStore = create<DemoState & DemoActions>((set, get) => ({
  isDemo: false,
  demoUser: {
    id: DEMO_USER_ID,
    email: 'demo@dolate.com',
    name: 'Demo User'
  },
  articles: demoArticles,
  tags: demoTags,

  enterDemoMode: () => {
    console.log('🎭 Entering demo mode');
    set({ 
      isDemo: true,
      articles: [...demoArticles] // Create a fresh copy for mutations
    });
  },

  exitDemoMode: () => {
    console.log('🎭 Exiting demo mode');
    set({ 
      isDemo: false,
      articles: [...demoArticles] // Reset to original demo data
    });
  },

  addDemoArticle: (articleData) => {
    const newArticle: Article = {
      ...articleData,
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: DEMO_USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    set(state => ({
      articles: [newArticle, ...state.articles]
    }));

    console.log('📄 Added demo article:', newArticle.title);
    return newArticle;
  },

  updateDemoArticle: (id, updates) => {
    set(state => ({
      articles: state.articles.map(article =>
        article.id === id
          ? { ...article, ...updates, updated_at: new Date().toISOString() }
          : article
      )
    }));

    console.log('📝 Updated demo article:', id);
  },

  deleteDemoArticle: (id) => {
    set(state => ({
      articles: state.articles.filter(article => article.id !== id)
    }));

    console.log('🗑️ Deleted demo article:', id);
  },

  toggleDemoFavorite: (id) => {
    const { articles } = get();
    const article = articles.find(a => a.id === id);
    
    if (article) {
      get().updateDemoArticle(id, { is_favorite: !article.is_favorite });
      console.log(`${article.is_favorite ? '💔' : '❤️'} Toggled favorite for:`, article.title);
    }
  },

  markDemoAsRead: (id) => {
    const { articles } = get();
    const article = articles.find(a => a.id === id);
    
    if (article && !article.is_read) {
      get().updateDemoArticle(id, { is_read: true });
      console.log('👁️ Marked as read:', article.title);
    }
  },

  searchDemoArticles: (query) => {
    const { articles } = get();
    const searchQuery = query.toLowerCase().trim();
    
    if (!searchQuery) return articles;

    return articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery) ||
      article.description.toLowerCase().includes(searchQuery) ||
      article.domain.toLowerCase().includes(searchQuery) ||
      article.author?.toLowerCase().includes(searchQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  },

  getDemoArticleById: (id) => {
    const { articles } = get();
    return articles.find(article => article.id === id);
  },
}));

// Utility function to check if we should use demo mode
export const shouldUseDemoMode = () => {
  // Can be extended with more logic (e.g., checking environment, user preference)
  return true; // For now, always allow demo mode
};

// Helper to get demo article count
export const getDemoStats = () => {
  const store = useDemoStore.getState();
  const totalArticles = store.articles.length;
  const unreadArticles = store.articles.filter(a => !a.is_read).length;
  const favoriteArticles = store.articles.filter(a => a.is_favorite).length;
  const totalTags = store.tags.length;

  return {
    totalArticles,
    unreadArticles,
    favoriteArticles,
    totalTags,
    readArticles: totalArticles - unreadArticles
  };
};