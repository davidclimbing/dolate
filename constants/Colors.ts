/**
 * Unified color system for Dolate app with comprehensive theme support
 * Supports light/dark modes with semantic color naming
 */

// Base color palette
const palette = {
  // Primary colors
  blue: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  
  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Status colors
  red: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  
  green: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  
  amber: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
};

// Theme configuration
const tintColorLight = palette.blue[600];
const tintColorDark = palette.blue[400];

export const Colors = {
  light: {
    // Text colors
    text: palette.gray[900],
    textSecondary: palette.gray[600],
    textMuted: palette.gray[500],
    
    // Background colors
    background: '#ffffff',
    backgroundSecondary: palette.gray[50],
    backgroundTertiary: palette.gray[100],
    
    // UI colors
    tint: tintColorLight,
    border: palette.gray[200],
    borderLight: palette.gray[100],
    
    // Component colors
    input: '#ffffff',
    inputBorder: palette.gray[300],
    inputBorderFocus: tintColorLight,
    
    // Icon colors
    icon: palette.gray[500],
    iconSecondary: palette.gray[400],
    tabIconDefault: palette.gray[400],
    tabIconSelected: tintColorLight,
    
    // Status colors
    error: palette.red[500],
    errorBackground: palette.red[50],
    success: palette.green[500],
    successBackground: palette.green[50],
    warning: palette.amber[500],
    warningBackground: palette.amber[50],
    
    // Interactive colors
    link: tintColorLight,
    linkHover: palette.blue[700],
    
    // Card and surface colors
    cardBackground: '#ffffff',
    cardBorder: palette.gray[200],
    cardShadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  dark: {
    // Text colors  
    text: palette.gray[100],
    textSecondary: palette.gray[300],
    textMuted: palette.gray[400],
    
    // Background colors
    background: '#000000',
    backgroundSecondary: palette.gray[900],
    backgroundTertiary: palette.gray[800],
    
    // UI colors
    tint: tintColorDark,
    border: palette.gray[700],
    borderLight: palette.gray[800],
    
    // Component colors
    input: palette.gray[900],
    inputBorder: palette.gray[600],
    inputBorderFocus: tintColorDark,
    
    // Icon colors
    icon: palette.gray[400],
    iconSecondary: palette.gray[500],
    tabIconDefault: palette.gray[500],
    tabIconSelected: tintColorDark,
    
    // Status colors
    error: palette.red[400],
    errorBackground: 'rgba(239, 68, 68, 0.1)',
    success: palette.green[400],
    successBackground: 'rgba(34, 197, 94, 0.1)',
    warning: palette.amber[400],
    warningBackground: 'rgba(245, 158, 11, 0.1)',
    
    // Interactive colors
    link: tintColorDark,
    linkHover: palette.blue[300],
    
    // Card and surface colors
    cardBackground: palette.gray[900],
    cardBorder: palette.gray[700],
    cardShadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// Semantic color mappings for easier usage
export const semanticColors = {
  primary: {
    light: Colors.light.tint,
    dark: Colors.dark.tint,
  },
  surface: {
    light: Colors.light.cardBackground,
    dark: Colors.dark.cardBackground,
  },
  outline: {
    light: Colors.light.border,
    dark: Colors.dark.border,
  },
} as const;

// Export palette for direct access when needed
export { palette };

export default Colors;