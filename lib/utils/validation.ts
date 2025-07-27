// Form validation utilities for authentication

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (trimmedEmail.length > 320) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (max 128 characters)' };
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter) {
    return { isValid: false, error: 'Password must contain at least one letter' };
  }
  
  if (!hasNumber) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

export const validatePasswordConfirmation = (
  password: string, 
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  if (score <= 2) {
    return { score, label: 'Weak', color: '#ef4444' };
  } else if (score <= 4) {
    return { score, label: 'Fair', color: '#f59e0b' };
  } else if (score <= 5) {
    return { score, label: 'Good', color: '#10b981' };
  } else {
    return { score, label: 'Strong', color: '#059669' };
  }
};

export const formatAuthError = (error: any): string => {
  if (!error) return 'An unexpected error occurred';
  
  const message = error.message || error.error_description || error.error || '';
  
  // Common Supabase auth error messages
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  if (message.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  }
  
  if (message.includes('Email already registered') || message.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 8 characters long with letters and numbers.';
  }
  
  if (message.includes('Invalid email')) {
    return 'Please enter a valid email address.';
  }
  
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Return original message if no specific handling
  return message || 'An unexpected error occurred. Please try again.';
};