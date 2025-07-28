import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/lib/stores/auth';
import { getDemoStats, useDemoStore } from '@/lib/stores/demo';
import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { user, signOut, loading } = useAuthStore();
  const { isDemo, demoUser, exitDemoMode } = useDemoStore();
  
  // Get stats based on current mode
  const stats = isDemo ? getDemoStats() : {
    totalArticles: 0,
    readArticles: 0,
    favoriteArticles: 0,
    totalTags: 0
  };

  const handleSignOut = async () => {
    if (isDemo) {
      Alert.alert(
        'Exit Demo Mode',
        'Are you sure you want to exit demo mode?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Exit Demo', 
            style: 'destructive',
            onPress: () => {
              exitDemoMode();
              // Will redirect to login via app index
            }
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void; 
  }) => (
    <ThemedView 
      style={[
        styles.menuItem,
        { borderBottomColor: Colors[colorScheme ?? 'light'].tabIconDefault }
      ]}
      onTouchEnd={onPress}
    >
      <IconSymbol 
        size={24} 
        name={icon as any} 
        color={Colors[colorScheme ?? 'light'].tint} 
      />
      <ThemedView style={styles.menuContent}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.menuSubtitle}>{subtitle}</ThemedText>
        )}
      </ThemedView>
      <IconSymbol 
        size={16} 
        name="chevron.right" 
        color={Colors[colorScheme ?? 'light'].tabIconDefault} 
      />
    </ThemedView>
  );

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <IconSymbol 
            size={80} 
            name="person.circle.fill" 
            color={Colors[colorScheme ?? 'light'].tint}
          />
          <ThemedText type="title" style={styles.userName}>
            {isDemo ? demoUser.name : (user?.email || 'Guest User')}
          </ThemedText>
          <ThemedText style={styles.userSubtitle}>
            {isDemo ? '🎭 Demo Mode' : 'Dolate Reader'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Reading Stats
          </ThemedText>
          
          <MenuItem
            icon="doc.text.fill"
            title="Articles Saved"
            subtitle={`${stats.totalArticles} articles`}
          />
          
          <MenuItem
            icon="checkmark.circle.fill"
            title="Articles Read"
            subtitle={`${stats.readArticles} articles`}
          />
          
          <MenuItem
            icon="heart.fill"
            title="Favorites"
            subtitle={`${stats.favoriteArticles} articles`}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          
          <MenuItem
            icon="tag.fill"
            title="Manage Tags"
            subtitle="Organize your articles"
          />
          
          <MenuItem
            icon="moon.fill"
            title="Reading Preferences"
            subtitle="Font size, theme, etc."
          />
          
          <MenuItem
            icon="arrow.down.circle.fill"
            title="Offline Reading"
            subtitle="Download articles for offline access"
          />
          
          <MenuItem
            icon="square.and.arrow.up.fill"
            title="Export Data"
            subtitle="Export your saved articles"
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <MenuItem
            icon="questionmark.circle.fill"
            title="Help & Support"
            subtitle="Get help or send feedback"
          />
          
          <MenuItem
            icon="info.circle.fill"
            title="About Dolate"
            subtitle="Version 1.0.0"
          />
        </ThemedView>

        <ThemedView style={styles.signOutContainer}>
          <ThemedView 
            style={[
              styles.signOutButton,
              { borderColor: Colors[colorScheme ?? 'light'].tint }
            ]}
            onTouchEnd={handleSignOut}
          >
            <IconSymbol 
              size={20} 
              name="rectangle.portrait.and.arrow.right" 
              color={Colors[colorScheme ?? 'light'].tint} 
            />
            <ThemedText 
              style={[
                styles.signOutText,
                { color: Colors[colorScheme ?? 'light'].tint }
              ]}
            >
              {loading ? 'Signing Out...' : (isDemo ? 'Exit Demo' : 'Sign Out')}
            </ThemedText>
          </ThemedView>
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
    marginBottom: 30,
  },
  userName: {
    marginTop: 16,
    marginBottom: 4,
  },
  userSubtitle: {
    opacity: 0.7,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuSubtitle: {
    opacity: 0.7,
    fontSize: 14,
    marginTop: 2,
  },
  signOutContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  signOutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});