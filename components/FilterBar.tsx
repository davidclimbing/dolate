import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useArticleStore } from '@/lib/stores/articles';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

interface FilterBarProps {
  onFilterChange?: () => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const colorScheme = useColorScheme();
  const {
    showUnreadOnly,
    showFavoritesOnly,
    selectedTags,
    toggleUnreadOnly,
    toggleFavoritesOnly,
    setSelectedTags,
    articles
  } = useArticleStore();
  
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Extract all unique tags from articles
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach(article => {
      article.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [articles]);

  const handleToggleUnread = () => {
    toggleUnreadOnly();
    onFilterChange?.();
  };

  const handleToggleFavorites = () => {
    toggleFavoritesOnly();
    onFilterChange?.();
  };

  const handleTagPress = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilterChange?.();
  };

  const clearAllFilters = () => {
    if (showUnreadOnly) toggleUnreadOnly();
    if (showFavoritesOnly) toggleFavoritesOnly();
    if (selectedTags.length > 0) setSelectedTags([]);
    onFilterChange?.();
  };

  const hasActiveFilters = showUnreadOnly || showFavoritesOnly || selectedTags.length > 0;

  const FilterChip = ({ 
    label, 
    isSelected, 
    onPress, 
    icon 
  }: { 
    label: string; 
    isSelected: boolean; 
    onPress: () => void; 
    icon?: string;
  }) => (
    <Pressable
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected 
            ? Colors[colorScheme ?? 'light'].tint 
            : 'transparent',
          borderColor: isSelected 
            ? Colors[colorScheme ?? 'light'].tint 
            : Colors[colorScheme ?? 'light'].tabIconDefault,
        }
      ]}
      onPress={onPress}
    >
      {icon && (
        <IconSymbol 
          size={16} 
          name={icon as any} 
          color={isSelected ? 'white' : Colors[colorScheme ?? 'light'].text}
        />
      )}
      <ThemedText 
        style={[
          styles.filterChipText,
          { color: isSelected ? 'white' : Colors[colorScheme ?? 'light'].text }
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  if (!hasActiveFilters && allTags.length === 0) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FilterChip
          label="Unread"
          isSelected={showUnreadOnly}
          onPress={handleToggleUnread}
          icon="envelope.badge"
        />
        
        <FilterChip
          label="Favorites"
          isSelected={showFavoritesOnly}
          onPress={handleToggleFavorites}
          icon="heart.fill"
        />
        
        {allTags.slice(0, showAllFilters ? allTags.length : 5).map((tag) => (
          <FilterChip
            key={tag}
            label={tag}
            isSelected={selectedTags.includes(tag)}
            onPress={() => handleTagPress(tag)}
            icon="tag.fill"
          />
        ))}
        
        {allTags.length > 5 && (
          <Pressable
            style={[
              styles.filterChip,
              { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
            ]}
            onPress={() => setShowAllFilters(!showAllFilters)}
          >
            <IconSymbol 
              size={16} 
              name={showAllFilters ? "chevron.left" : "chevron.right"}
              color={Colors[colorScheme ?? 'light'].text}
            />
            <ThemedText style={styles.filterChipText}>
              {showAllFilters ? 'Less' : `+${allTags.length - 5}`}
            </ThemedText>
          </Pressable>
        )}
        
        {hasActiveFilters && (
          <Pressable
            style={[
              styles.clearButton,
              { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
            ]}
            onPress={clearAllFilters}
          >
            <IconSymbol 
              size={16} 
              name="xmark.circle.fill"
              color={Colors[colorScheme ?? 'light'].tabIconDefault}
            />
            <ThemedText 
              style={[
                styles.clearButtonText,
                { color: Colors[colorScheme ?? 'light'].tabIconDefault }
              ]}
            >
              Clear
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
      
      {hasActiveFilters && (
        <ThemedView style={styles.summary}>
          <ThemedText style={styles.summaryText}>
            {showUnreadOnly ? 'Unread' : ''}
            {showFavoritesOnly ? 'Favorites' : ''}
            {selectedTags.map(tag => `#${tag}`).join(' ')}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingRight: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.tabIconDefault,
  },
  summaryText: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});