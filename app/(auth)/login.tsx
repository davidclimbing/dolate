import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isDummyConfig } from '@/lib/config';
import { useAuthStore } from '@/lib/stores/auth';
import { useDemoStore } from '@/lib/stores/demo';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const { signIn } = useAuthStore();
  const { enterDemoMode } = useDemoStore();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.push('/(auth)/signup');
  };

  const handleDemoMode = () => {
    enterDemoMode();
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <IconSymbol 
          size={80} 
          name="doc.text.fill" 
          color={Colors[colorScheme ?? 'light'].tint}
        />
        <ThemedText type="title" style={styles.title}>
          Welcome to Dolate
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Your personal read-it-later app
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedView style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Email
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                color: Colors[colorScheme ?? 'light'].text,
              }
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Password
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                color: Colors[colorScheme ?? 'light'].text,
              }
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            secureTextEntry
            autoCorrect={false}
          />
        </ThemedView>

        <Pressable 
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint },
            isLoading && styles.buttonDisabled
          ]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </ThemedText>
        </Pressable>

        {isDummyConfig() && (
          <ThemedView style={styles.demoContainer}>
            <ThemedView style={styles.divider} />
            <ThemedText style={styles.demoLabel}>
              No Supabase setup required
            </ThemedText>
            <Pressable 
              style={[
                styles.demoButton,
                { borderColor: Colors[colorScheme ?? 'light'].tint }
              ]}
              onPress={handleDemoMode}
            >
              <IconSymbol 
                size={20} 
                name="theatermasks.fill" 
                color={Colors[colorScheme ?? 'light'].tint}
              />
              <ThemedText style={[
                styles.demoButtonText,
                { color: Colors[colorScheme ?? 'light'].tint }
              ]}>
                Try Demo Mode
              </ThemedText>
            </Pressable>
            <ThemedText style={styles.demoDescription}>
              Experience all features with sample data
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Don&apos;t have an account?
          </ThemedText>
          <Pressable onPress={navigateToSignUp}>
            <ThemedText style={[
              styles.linkText,
              { color: Colors[colorScheme ?? 'light'].tint }
            ]}>
              Sign Up
            </ThemedText>
          </Pressable>
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
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 6,
  },
  footerText: {
    opacity: 0.7,
  },
  linkText: {
    fontWeight: '600',
  },
  demoContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.light.border,
    opacity: 0.3,
    marginBottom: 20,
  },
  demoLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 2,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  demoDescription: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});