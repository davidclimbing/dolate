import { supabase } from '../supabase';
import type { Article, ArticleInsert, ArticleUpdate } from '../stores/articles';

export class ArticleAPI {
  static async getArticles(userId: string): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createArticle(article: ArticleInsert): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .insert(article)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateArticle(id: string, updates: ArticleUpdate): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteArticle(id: string): Promise<void> {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async searchArticles(userId: string, query: string): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,domain.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getArticlesByTag(userId: string, tag: string): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', userId)
      .contains('tags', [tag])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async markAsRead(id: string): Promise<Article> {
    return this.updateArticle(id, { is_read: true });
  }

  static async toggleFavorite(id: string, isFavorite: boolean): Promise<Article> {
    return this.updateArticle(id, { is_favorite: isFavorite });
  }

  static async getUnreadArticles(userId: string): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getFavoriteArticles(userId: string): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}