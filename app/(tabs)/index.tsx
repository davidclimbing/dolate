import { ArticleCard } from '@/components/ArticleCard';
import { FilterBar } from '@/components/FilterBar';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ArticleAPI } from '@/lib/api/articles';
import { useArticleStore, type Article } from '@/lib/stores/articles';
import { useAuthStore } from '@/lib/stores/auth';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TextInput } from 'react-native';

export default function ArticlesScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuthStore();
  const { 
    articles, 
    loading, 
    searchQuery, 
    setSearchQuery, 
    getFilteredArticles,
    showUnreadOnly,
    showFavoritesOnly,
    selectedTags,
    setArticles,
    setLoading,
    loadFromCache,
    initializeNetworkMonitoring,
    isOffline,
    lastSyncTime
  } = useArticleStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Initialize network monitoring
    initializeNetworkMonitoring();
  }, []);

  useEffect(() => {
    if (user) {
      // Load from cache first for fast startup
      loadFromCache(user.id);
      // Then load fresh data
      loadArticles();
    }
  }, [user]);

  const loadArticles = async () => {
    if (!user) return;
    
    // Don't show loading if we have cached data
    const shouldShowLoading = articles.length === 0;
    if (shouldShowLoading) {
      setLoading(true);
    }
    
    try {
      if (isOffline) {
        console.log('Offline mode: using cached articles');
        return;
      }
      
      const userArticles = await ArticleAPI.getArticles(user.id);
      setArticles(userArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
      // Fallback to cache if network request fails
      if (articles.length === 0) {
        loadFromCache(user.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const { markAsRead, toggleFavorite } = useArticleStore();

  const handleArticlePress = (article: Article) => {
    router.push(`/article/${article.id}` as any);
  };

  const handleToggleFavorite = (article: Article) => {
    toggleFavorite(article.id);
  };

  const ArticleItem = ({ item }: { item: Article }) => (
    <ArticleCard
      article={item}
      onPress={() => handleArticlePress(item)}
      onToggleFavorite={() => handleToggleFavorite(item)}
      onMarkAsRead={() => markAsRead(item.id)}
    />
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadArticles();
    setRefreshing(false);
  };

  const filteredArticles = getFilteredArticles();

  const EmptyState = () => {
    const hasFilters = searchQuery || showUnreadOnly || showFavoritesOnly || selectedTags.length > 0;
    
    return (
      <ThemedView style={styles.emptyContainer}>
        <IconSymbol 
          size={80} 
          name={hasFilters ? "magnifyingglass" : "doc.text"} 
          color={Colors[colorScheme ?? 'light'].icon}
        />
        <ThemedText type="title" style={styles.emptyTitle}>
          {hasFilters ? 'No Matching Articles' : 'No Articles Yet'}
        </ThemedText>
        <ThemedText style={styles.emptyDescription}>
          {hasFilters 
            ? 'Try adjusting your search or filters to find articles'
            : 'Start building your reading list by adding articles from the Add tab'
          }
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>Articles</ThemedText>
          {isOffline && (
            <ThemedView style={styles.offlineBadge}>
              <IconSymbol 
                size={16} 
                name="wifi.slash" 
                color="white"
              />
              <ThemedText style={styles.offlineText}>Offline</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        
        <TextInput
          style={[
            styles.searchInput,
            { 
              backgroundColor: Colors[colorScheme ?? 'light'].input,
              borderColor: Colors[colorScheme ?? 'light'].inputBorder,
              color: Colors[colorScheme ?? 'light'].text,
            }
          ]}
          placeholder="Search articles..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        {lastSyncTime && (
          <ThemedText style={styles.lastSync}>
            Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
          </ThemedText>
        )}
      </ThemedView>
      
      <FilterBar onFilterChange={() => {/* Force re-render */}} />
      
      <FlatList
        data={filteredArticles}
        renderItem={ArticleItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors[colorScheme ?? 'light'].tint}
          />
        }
        ListEmptyComponent={EmptyState}
        contentContainerStyle={filteredArticles.length === 0 ? styles.emptyList : undefined}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    flex: 1,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  lastSync: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyList: {
    flex: 1,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});