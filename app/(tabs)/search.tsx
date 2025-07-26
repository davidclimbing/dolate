import React from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AddScreen() {
  const colorScheme = useColorScheme();

  const handleOpenAddModal = () => {
    router.push('/add-url');
  };

  const handleQuickActions = (action: string) => {
    console.log('Quick action:', action);
    // TODO: Implement quick actions
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
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

        <ThemedView style={styles.actionsContainer}>
          <Pressable 
            style={[
              styles.primaryButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].tint }
            ]}
            onPress={handleOpenAddModal}
          >
            <IconSymbol 
              size={24} 
              name="plus" 
              color="white"
            />
            <ThemedText style={styles.primaryButtonText}>
              Add from URL
            </ThemedText>
          </Pressable>
          
          <ThemedView style={styles.quickActionsGrid}>
            <Pressable 
              style={[
                styles.quickAction,
                { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
              ]}
              onPress={() => handleQuickActions('share')}
            >
              <IconSymbol 
                size={32} 
                name="square.and.arrow.up" 
                color={Colors[colorScheme ?? 'light'].tint}
              />
              <ThemedText style={styles.quickActionText}>
                Share to Dolate
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={[
                styles.quickAction,
                { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
              ]}
              onPress={() => handleQuickActions('camera')}
            >
              <IconSymbol 
                size={32} 
                name="camera" 
                color={Colors[colorScheme ?? 'light'].tint}
              />
              <ThemedText style={styles.quickActionText}>
                Scan QR Code
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={[
                styles.quickAction,
                { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
              ]}
              onPress={() => handleQuickActions('bookmarks')}
            >
              <IconSymbol 
                size={32} 
                name="bookmark" 
                color={Colors[colorScheme ?? 'light'].tint}
              />
              <ThemedText style={styles.quickActionText}>
                Import Bookmarks
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={[
                styles.quickAction,
                { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
              ]}
              onPress={() => handleQuickActions('clipboard')}
            >
              <IconSymbol 
                size={32} 
                name="doc.on.clipboard" 
                color={Colors[colorScheme ?? 'light'].tint}
              />
              <ThemedText style={styles.quickActionText}>
                From Clipboard
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
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    gap: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickAction: {
    width: '47%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  quickActionText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
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