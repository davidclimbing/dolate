import React, { useState } from 'react';
import { StyleSheet, TextInput, Alert, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/lib/stores/auth';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const { signUp } = useAuthStore();

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Account created successfully! Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <IconSymbol 
          size={80} 
          name="person.badge.plus.fill" 
          color={Colors[colorScheme ?? 'light'].tint}
        />
        <ThemedText type="title" style={styles.title}>
          Create Account
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Join Dolate to start saving articles
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
            placeholder="Create a password (min 6 characters)"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            secureTextEntry
            autoCorrect={false}
          />
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Confirm Password
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
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
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
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </ThemedText>
        </Pressable>

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Already have an account?
          </ThemedText>
          <Pressable onPress={navigateToLogin}>
            <ThemedText style={[
              styles.linkText,
              { color: Colors[colorScheme ?? 'light'].tint }
            ]}>
              Sign In
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
});