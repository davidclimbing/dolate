import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { Article } from '@/lib/stores/articles';

interface ArticleCardProps {
  article: Article;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  onMarkAsRead?: () => void;
}

export function ArticleCard({ 
  article, 
  onPress, 
  onToggleFavorite, 
  onMarkAsRead 
}: ArticleCardProps) {
  const colorScheme = useColorScheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Pressable onPress={onPress}>
      <ThemedView style={[
        styles.container,
        { borderBottomColor: Colors[colorScheme ?? 'light'].border }
      ]}>
        {article.image_url && (
          <ThemedView style={styles.imageContainer}>
            {/* TODO: Add proper image component */}
            <ThemedView style={[
              styles.imagePlaceholder,
              { backgroundColor: Colors[colorScheme ?? 'light'].backgroundSecondary }
            ]}>
              <IconSymbol 
                size={32} 
                name="photo" 
                color={Colors[colorScheme ?? 'light'].iconSecondary}
              />
            </ThemedView>
          </ThemedView>
        )}
        
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>
              {article.title}
            </ThemedText>
            
            <Pressable onPress={onToggleFavorite} style={styles.favoriteButton}>
              <IconSymbol 
                size={20} 
                name={article.is_favorite ? "heart.fill" : "heart"} 
                color={article.is_favorite ? Colors[colorScheme ?? 'light'].error : Colors[colorScheme ?? 'light'].icon}
              />
            </Pressable>
          </ThemedView>
          
          {article.description && (
            <ThemedText style={styles.description} numberOfLines={2}>
              {article.description}
            </ThemedText>
          )}
          
          <ThemedView style={styles.footer}>
            <ThemedView style={styles.meta}>
              <ThemedText style={styles.domain}>
                {article.domain}
              </ThemedText>
              <ThemedText style={styles.separator}>•</ThemedText>
              <ThemedText style={styles.date}>
                {formatDate(article.created_at)}
              </ThemedText>
              {article.reading_time && (
                <>
                  <ThemedText style={styles.separator}>•</ThemedText>
                  <ThemedText style={styles.readingTime}>
                    {article.reading_time} min read
                  </ThemedText>
                </>
              )}
            </ThemedView>
            
            <ThemedView style={styles.actions}>
              {!article.is_read && (
                <ThemedView style={[
                  styles.unreadBadge,
                  { backgroundColor: Colors[colorScheme ?? 'light'].tint }
                ]}>
                  <ThemedText style={styles.unreadText}>NEW</ThemedText>
                </ThemedView>
              )}
              
              {article.tags.length > 0 && (
                <IconSymbol 
                  size={16} 
                  name="tag.fill" 
                  color={Colors[colorScheme ?? 'light'].icon}
                />
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  favoriteButton: {
    padding: 4,
  },
  description: {
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 18,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  domain: {
    fontSize: 12,
    opacity: 0.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  separator: {
    fontSize: 12,
    opacity: 0.4,
    marginHorizontal: 6,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  readingTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});