import React, { useState, useCallback } from 'react';
import { StyleSheet, TextInput, Alert, ScrollView, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordConfirmation,
  getPasswordStrength,
  formatAuthError 
} from '@/lib/utils/validation';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  
  const colorScheme = useColorScheme();
  const { signUp } = useAuthStore();
  
  const passwordStrength = getPasswordStrength(password);

  // Validation handlers
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailError('');
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setPasswordError('');
    setShowPasswordStrength(text.length > 0);
  }, []);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError('');
  }, []);

  const validateForm = (): boolean => {
    let hasErrors = false;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      hasErrors = true;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || '');
      hasErrors = true;
    }

    // Validate password confirmation
    const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmValidation.isValid) {
      setConfirmPasswordError(confirmValidation.error || '');
      hasErrors = true;
    }

    return !hasErrors;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp(email.trim(), password);
      
      if (result.error) {
        const errorMessage = formatAuthError(result.error);
        Alert.alert('Sign Up Error', errorMessage);
      } else {
        const message = result.needsEmailConfirmation 
          ? 'Account created successfully! Please check your email to verify your account before signing in.'
          : 'Account created successfully! You can now sign in.';
          
        Alert.alert(
          'Welcome to Dolate!',
          message,
          [{ 
            text: 'Continue', 
            onPress: () => router.replace('/(auth)/login') 
          }]
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
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
                borderColor: emailError ? '#ef4444' : Colors[colorScheme ?? 'light'].tabIconDefault,
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                color: Colors[colorScheme ?? 'light'].text,
              }
            ]}
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Enter your email"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          {emailError ? (
            <ThemedText style={styles.errorText}>{emailError}</ThemedText>
          ) : null}
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Password
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: passwordError ? '#ef4444' : Colors[colorScheme ?? 'light'].tabIconDefault,
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                color: Colors[colorScheme ?? 'light'].text,
              }
            ]}
            value={password}
            onChangeText={handlePasswordChange}
            placeholder="Create a password (min 8 characters)"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            secureTextEntry
            autoCorrect={false}
          />
          {passwordError ? (
            <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
          ) : null}
          {showPasswordStrength && !passwordError && (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.passwordStrengthBar}>
                <View 
                  style={[
                    styles.passwordStrengthFill,
                    { 
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      backgroundColor: passwordStrength.color 
                    }
                  ]} 
                />
              </View>
              <ThemedText style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </ThemedText>
            </View>
          )}
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Confirm Password
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: confirmPasswordError ? '#ef4444' : Colors[colorScheme ?? 'light'].tabIconDefault,
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                color: Colors[colorScheme ?? 'light'].text,
              }
            ]}
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            placeholder="Confirm your password"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            secureTextEntry
            autoCorrect={false}
          />
          {confirmPasswordError ? (
            <ThemedText style={styles.errorText}>{confirmPasswordError}</ThemedText>
          ) : null}
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
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 6,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});