import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Hook for accessing semantic colors with current theme support
 * Provides easy access to commonly used color patterns
 */
export function useSemanticColors() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return {
    // Text colors
    primary: colors.text,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    
    // Background colors
    background: colors.background,
    surface: colors.backgroundSecondary,
    card: colors.cardBackground,
    
    // Interactive colors
    accent: colors.tint,
    link: colors.link,
    linkHover: colors.linkHover,
    
    // Status colors
    error: colors.error,
    errorBackground: colors.errorBackground,
    success: colors.success,
    successBackground: colors.successBackground,
    warning: colors.warning,
    warningBackground: colors.warningBackground,
    
    // UI elements
    border: colors.border,
    borderLight: colors.borderLight,
    icon: colors.icon,
    iconSecondary: colors.iconSecondary,
    
    // Input elements
    input: colors.input,
    inputBorder: colors.inputBorder,
    inputBorderFocus: colors.inputBorderFocus,
    
    // Helper function to get colors dynamically
    getColor: (colorKey: keyof typeof colors) => colors[colorKey],
    
    // Current theme
    theme: colorScheme ?? 'light',
  };
}

/**
 * Hook for status-specific styling
 */
export function useStatusColors() {
  const { error, errorBackground, success, successBackground, warning, warningBackground } = useSemanticColors();
  
  return {
    error: {
      text: error,
      background: errorBackground,
    },
    success: {
      text: success,
      background: successBackground,
    },
    warning: {
      text: warning,
      background: warningBackground,
    },
  };
}

/**
 * Hook for interactive element styling
 */
export function useInteractiveColors() {
  const { accent, link, linkHover, border, background } = useSemanticColors();
  
  return {
    button: {
      primary: accent,
      primaryText: '#ffffff',
      secondary: background,
      secondaryText: accent,
      border: border,
    },
    link: {
      default: link,
      hover: linkHover,
    },
  };
}