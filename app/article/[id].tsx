import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Share, 
  Pressable,
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useArticleStore, type Article } from '@/lib/stores/articles';
import { useDemoStore } from '@/lib/stores/demo';
import { ArticleAPI } from '@/lib/api/articles';
import { MetadataAPI } from '@/lib/api/metadata';

const { width } = Dimensions.get('window');

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [fullContent, setFullContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  
  const { articles, markAsRead, toggleFavorite, updateArticle } = useArticleStore();
  const { 
    isDemo, 
    getDemoArticleById, 
    markDemoAsRead, 
    toggleDemoFavorite, 
    updateDemoArticle 
  } = useDemoStore();

  useEffect(() => {
    if (id) {
      loadArticle(id);
    }
  }, [id]);

  useEffect(() => {
    if (article) {
      navigation.setOptions({
        title: '',
        headerRight: () => (
          <ThemedView style={styles.headerActions}>
            <Pressable 
              onPress={handleToggleFavorite}
              style={styles.headerButton}
            >
              <IconSymbol 
                size={24} 
                name={article.is_favorite ? "heart.fill" : "heart"} 
                color={article.is_favorite ? "#ff4444" : Colors[colorScheme ?? 'light'].text}
              />
            </Pressable>
            <Pressable 
              onPress={handleShare}
              style={styles.headerButton}
            >
              <IconSymbol 
                size={24} 
                name="square.and.arrow.up" 
                color={Colors[colorScheme ?? 'light'].text}
              />
            </Pressable>
          </ThemedView>
        ),
      });
      
      // Mark as read when opening
      if (!article.is_read) {
        if (isDemo) {
          markDemoAsRead(article.id);
        } else {
          markAsRead(article.id);
          updateArticleInDatabase({ is_read: true });
        }
      }
    }
  }, [article, colorScheme]);

  const loadArticle = async (articleId: string) => {
    try {
      const foundArticle = isDemo 
        ? getDemoArticleById(articleId)
        : articles.find(a => a.id === articleId);
        
      if (foundArticle) {
        setArticle(foundArticle);
        
        // Load full content if not available (only for non-demo mode)
        if (!foundArticle.content && !isDemo) {
          loadFullContent(foundArticle.url);
        } else {
          setFullContent(foundArticle.content || '');
        }
      } else {
        Alert.alert('Error', 'Article not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading article:', error);
      Alert.alert('Error', 'Failed to load article');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadFullContent = async (url: string) => {
    if (contentLoading) return;
    
    setContentLoading(true);
    try {
      const content = await MetadataAPI.fetchFullContent(url);
      setFullContent(content);
      
      // Update article with full content
      if (article) {
        const updatedArticle = { ...article, content };
        setArticle(updatedArticle);
        updateArticleInDatabase({ content });
      }
    } catch (error) {
      console.error('Error loading full content:', error);
      setFullContent('Unable to load full content. Please visit the original article.');
    } finally {
      setContentLoading(false);
    }
  };

  const updateArticleInDatabase = async (updates: Partial<Article>) => {
    if (!article) return;
    
    try {
      if (isDemo) {
        updateDemoArticle(article.id, updates);
      } else {
        await ArticleAPI.updateArticle(article.id, updates);
        updateArticle(article.id, updates);
      }
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };

  const handleToggleFavorite = () => {
    if (!article) return;
    
    if (isDemo) {
      toggleDemoFavorite(article.id);
    } else {
      toggleFavorite(article.id);
      updateArticleInDatabase({ is_favorite: !article.is_favorite });
    }
  };

  const handleShare = async () => {
    if (!article) return;
    
    try {
      await Share.share({
        message: `${article.title}\n\n${article.url}`,
        url: article.url,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleOpenOriginal = () => {
    if (!article) return;
    
    Alert.alert(
      'Open Original',
      'This will open the article in your browser',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open', 
          onPress: () => {
            // TODO: Open in WebView or external browser
            console.log('Opening:', article.url);
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={Colors[colorScheme ?? 'light'].tint} 
        />
        <ThemedText style={styles.loadingText}>Loading article...</ThemedText>
      </ThemedView>
    );
  }

  if (!article) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol 
          size={80} 
          name="exclamationmark.triangle" 
          color={Colors[colorScheme ?? 'light'].tabIconDefault}
        />
        <ThemedText type="title">Article Not Found</ThemedText>
        <Pressable 
          style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {article.image_url && (
        <Image
          source={{ uri: article.image_url }}
          style={styles.heroImage}
          contentFit="cover"
          placeholder="Loading..."
        />
      )}
      
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {article.title}
          </ThemedText>
          
          <ThemedView style={styles.meta}>
            <ThemedText style={styles.domain}>
              {article.domain.toUpperCase()}
            </ThemedText>
            {article.author && (
              <>
                <ThemedText style={styles.separator}>•</ThemedText>
                <ThemedText style={styles.author}>
                  {article.author}
                </ThemedText>
              </>
            )}
            {article.reading_time && (
              <>
                <ThemedText style={styles.separator}>•</ThemedText>
                <ThemedText style={styles.readingTime}>
                  {article.reading_time} min read
                </ThemedText>
              </>
            )}
          </ThemedView>
          
          <ThemedText style={styles.date}>
            {formatDate(article.created_at)}
          </ThemedText>
        </ThemedView>
        
        {article.description && (
          <ThemedText style={styles.description}>
            {article.description}
          </ThemedText>
        )}
        
        <ThemedView style={styles.divider} />
        
        <ThemedView style={styles.articleContent}>
          {contentLoading ? (
            <ThemedView style={styles.contentLoading}>
              <ActivityIndicator 
                size="small" 
                color={Colors[colorScheme ?? 'light'].tint} 
              />
              <ThemedText style={styles.contentLoadingText}>
                Loading full content...
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedText style={styles.contentText}>
              {fullContent || article.content || 'Content not available. Please open the original article.'}
            </ThemedText>
          )}
        </ThemedView>
        
        <ThemedView style={styles.actions}>
          <Pressable 
            style={[
              styles.actionButton,
              { borderColor: Colors[colorScheme ?? 'light'].tint }
            ]}
            onPress={handleOpenOriginal}
          >
            <IconSymbol 
              size={20} 
              name="safari" 
              color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText 
              style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}
            >
              Open Original
            </ThemedText>
          </Pressable>
          
          {!fullContent && !contentLoading && !isDemo && (
            <Pressable 
              style={[
                styles.actionButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].tint }
              ]}
              onPress={() => loadFullContent(article.url)}
            >
              <IconSymbol 
                size={20} 
                name="arrow.down.circle" 
                color="white"
              />
              <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
                Load Full Content
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>
        
        {article.tags.length > 0 && (
          <ThemedView style={styles.tagsContainer}>
            <ThemedText type="defaultSemiBold" style={styles.tagsTitle}>
              Tags
            </ThemedText>
            <ThemedView style={styles.tags}>
              {article.tags.map((tag, index) => (
                <ThemedView 
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }
                  ]}
                >
                  <ThemedText style={styles.tagText}>
                    {tag}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  heroImage: {
    width,
    height: 200,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 12,
    lineHeight: 36,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  domain: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  separator: {
    marginHorizontal: 8,
    opacity: 0.5,
  },
  author: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  readingTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.tabIconDefault,
    opacity: 0.2,
    marginBottom: 20,
  },
  articleContent: {
    marginBottom: 30,
  },
  contentLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentLoadingText: {
    marginLeft: 12,
    opacity: 0.7,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'justify',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    marginTop: 20,
  },
  tagsTitle: {
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
});