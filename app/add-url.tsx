import React, { useState } from 'react';
import { StyleSheet, TextInput, Alert, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/lib/stores/auth';
import { useArticleStore } from '@/lib/stores/articles';
import { MetadataAPI } from '@/lib/api/metadata';
import { ArticleAPI } from '@/lib/api/articles';

export default function AddUrlModal() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const { user } = useAuthStore();
  const { addArticle } = useArticleStore();

  const handleAddArticle = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to add articles');
      return;
    }

    if (!MetadataAPI.isValidUrl(url)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedUrl = MetadataAPI.normalizeUrl(url);
      const metadata = await MetadataAPI.extractMetadata(normalizedUrl);
      
      const articleData = {
        title: metadata.title,
        url: normalizedUrl,
        description: metadata.description,
        image_url: metadata.image,
        author: metadata.author,
        published_at: metadata.publishedAt,
        domain: metadata.domain,
        reading_time: metadata.readingTime,
        user_id: user.id,
        is_read: false,
        is_favorite: false,
        tags: [],
      };

      const newArticle = await ArticleAPI.createArticle(articleData);
      addArticle(newArticle);
      
      Alert.alert('Success', 'Article added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      setUrl('');
    } catch (error) {
      console.error('Error adding article:', error);
      Alert.alert('Error', 'Failed to add article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <IconSymbol 
              size={24} 
              name="xmark" 
              color={Colors[colorScheme ?? 'light'].text}
            />
          </Pressable>
          
          <IconSymbol 
            size={60} 
            name="link.circle.fill" 
            color={Colors[colorScheme ?? 'light'].tint}
          />
          <ThemedText type="title" style={styles.title}>
            Add Article
          </ThemedText>
          <ThemedText style={styles.description}>
            Paste a URL to save an article for later reading
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Article URL
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: Colors[colorScheme ?? 'light'].tint,
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                color: Colors[colorScheme ?? 'light'].text,
              }
            ]}
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com/article"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
            onSubmitEditing={handleAddArticle}
            editable={!isLoading}
          />
          
          <ThemedView style={styles.buttonContainer}>
            <Pressable 
              style={[
                styles.button,
                { backgroundColor: Colors[colorScheme ?? 'light'].tint },
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleAddArticle}
              disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>
                {isLoading ? 'Adding...' : 'Add Article'}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.tipsContainer}>
          <ThemedText type="subtitle" style={styles.tipsTitle}>
            Tips
          </ThemedText>
          <ThemedText style={styles.tip}>
            • Works with articles from any website
          </ThemedText>
          <ThemedText style={styles.tip}>
            • Share URLs directly from other apps
          </ThemedText>
          <ThemedText style={styles.tip}>
            • Articles are automatically parsed and formatted
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 1,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 20,
  },
  tipsTitle: {
    marginBottom: 12,
  },
  tip: {
    marginBottom: 6,
    opacity: 0.8,
  },
});