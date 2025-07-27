import React from 'react';
import { StyleSheet, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SupabaseSetupGuide() {
  const colorScheme = useColorScheme();

  const openSupabase = () => {
    Linking.openURL('https://supabase.com');
  };

  const openDocs = () => {
    Linking.openURL('https://supabase.com/docs/guides/getting-started');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <IconSymbol 
          size={80} 
          name="exclamationmark.triangle.fill" 
          color={Colors[colorScheme ?? 'light'].tint}
        />
        <ThemedText type="title" style={styles.title}>
          Supabase Setup Required
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Environment variables are not configured properly. Please set up your Supabase project.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.guide}>
        <ThemedText type="subtitle" style={styles.stepTitle}>
          Follow these steps:
        </ThemedText>

        <ThemedView style={styles.step}>
          <ThemedText type="defaultSemiBold" style={styles.stepNumber}>
            1. Create Supabase Project
          </ThemedText>
          <ThemedText style={styles.stepDescription}>
            Go to supabase.com and create a new project (it's free!)
          </ThemedText>
          <Pressable 
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={openSupabase}
          >
            <ThemedText style={styles.buttonText}>
              Open Supabase
            </ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.step}>
          <ThemedText type="defaultSemiBold" style={styles.stepNumber}>
            2. Get API Credentials
          </ThemedText>
          <ThemedText style={styles.stepDescription}>
            In your project dashboard, go to Settings → API
          </ThemedText>
          <ThemedText style={styles.stepDescription}>
            Copy the "Project URL" and "anon/public" key
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.step}>
          <ThemedText type="defaultSemiBold" style={styles.stepNumber}>
            3. Update .env File
          </ThemedText>
          <ThemedText style={styles.stepDescription}>
            Update your .env file with the real credentials:
          </ThemedText>
          <ThemedView style={[styles.codeBlock, { backgroundColor: Colors[colorScheme ?? 'light'].backgroundSecondary }]}>
            <ThemedText style={styles.codeText}>
              EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co{'\n'}
              EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-key
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.step}>
          <ThemedText type="defaultSemiBold" style={styles.stepNumber}>
            4. Restart Development Server
          </ThemedText>
          <ThemedText style={styles.stepDescription}>
            Stop the development server (Ctrl+C) and restart:
          </ThemedText>
          <ThemedView style={[styles.codeBlock, { backgroundColor: Colors[colorScheme ?? 'light'].backgroundSecondary }]}>
            <ThemedText style={styles.codeText}>
              bun start
              {'\n'}# or
              {'\n'}expo start
            </ThemedText>
          </ThemedView>
          <ThemedText style={[styles.stepDescription, styles.warningText]}>
            ⚠️ Environment variables are only loaded when the server starts. A restart is required after updating .env
          </ThemedText>
        </ThemedView>

        <Pressable 
          style={[styles.docsButton, { borderColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={openDocs}
        >
          <ThemedText style={[styles.docsButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
            View Supabase Documentation
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  guide: {
    width: '100%',
  },
  stepTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  step: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  stepNumber: {
    marginBottom: 8,
    fontSize: 18,
  },
  stepDescription: {
    marginBottom: 12,
    lineHeight: 20,
    opacity: 0.8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  docsButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: 20,
  },
  docsButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  codeBlock: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 8,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    opacity: 0.8,
  },
  warningText: {
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: 8,
  },
});