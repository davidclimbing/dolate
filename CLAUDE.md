# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Read-it-Later** React Native/Expo application called "Dolate" using:
- **Expo SDK 53** with the new architecture enabled
- **React 19** and **React Native 0.79.5**
- **Expo Router** for file-based navigation with typed routes
- **TypeScript** with strict mode enabled
- **Bun** as the package manager (bun.lock present)
- **Supabase** for backend services (auth, database, real-time)
- **Zustand** for state management
- **Simple State Architecture** pattern

## Development Commands

**Start Development Server:**
```bash
expo start
# or bun start
```

**Platform-Specific Development:**
```bash
expo start --android    # Android development
expo start --ios        # iOS development  
expo start --web        # Web development
```

**Code Quality:**
```bash
expo lint               # Run ESLint (uses eslint-config-expo)
bun run typecheck       # Run TypeScript type checking (if configured)
```

**Package Management:**
```bash
bun install             # Install dependencies
bun add <package>       # Add new package
bun remove <package>    # Remove package
```

**Project Reset:**
```bash
bun run reset-project   # Move starter code to app-example/ and create blank app/
```

## Architecture

**File-Based Routing (Expo Router):**
- `app/_layout.tsx` - Root layout with auth initialization and navigation
- `app/(auth)/_layout.tsx` - Authentication flow layout
- `app/(auth)/login.tsx` - Sign in screen
- `app/(auth)/signup.tsx` - Sign up screen
- `app/(tabs)/_layout.tsx` - Main app tab navigation (Articles, Add, Profile)
- `app/(tabs)/index.tsx` - Articles list screen
- `app/(tabs)/search.tsx` - Add article screen
- `app/(tabs)/profile.tsx` - User profile and settings
- `app/article/[id].tsx` - Article reading screen
- `app/add-url.tsx` - URL addition modal
- `app/+not-found.tsx` - 404 screen

**State Management (Zustand):**
- `lib/stores/auth.ts` - Authentication state (user, session, auth actions)
- `lib/stores/articles.ts` - Articles state (list, filters, search, CRUD actions)
- `lib/stores/sync.ts` - Sync state (online status, pending changes)

**API Layer:**
- `lib/api/articles.ts` - Article CRUD operations with Supabase
- `lib/api/auth.ts` - Authentication operations
- `lib/api/metadata.ts` - URL metadata extraction and content parsing
- `lib/supabase.ts` - Supabase client configuration and types

**Component Structure:**
- `components/ArticleCard.tsx` - Article display component
- `components/ThemedText.tsx` - Themed text component
- `components/ThemedView.tsx` - Themed view component
- `components/ui/` - Platform-specific UI components

**Theming System:**
- `hooks/useColorScheme.ts` - Color scheme detection
- `hooks/useThemeColor.ts` - Theme color resolution
- `constants/Colors.ts` - Color definitions
- Automatic dark/light mode support

**Path Aliases:**
- `@/*` maps to root directory (configured in tsconfig.json)
- Import example: `import { useAuthStore } from '@/lib/stores/auth'`

## Key Patterns

**Themed Components:**
Components accept `lightColor` and `darkColor` props and automatically resolve colors based on the current theme.

**Platform-Specific Code:**
Uses `.ios.tsx` and platform-specific imports for iOS/Android differences (e.g., `IconSymbol.ios.tsx`).

**Key Features:**
- User authentication (sign up, sign in, sign out)
- Article saving from URLs with metadata extraction
- Article reading with offline support
- Search and filtering (by title, description, domain, tags)
- Favorites and read/unread status
- Tag management
- Cross-platform support (iOS, Android, Web)

**Expo Features in Use:**
- expo-camera with camera and microphone permissions configured
- expo-media-library with photo access and save permissions
- expo-haptics for haptic feedback
- expo-blur for iOS blur effects
- expo-symbols for SF Symbols on iOS
- expo-linking for deep linking support

## TypeScript Configuration

- Extends `expo/tsconfig.base`
- Strict mode enabled
- Typed routes experiment enabled in app.json
- Path mapping configured for `@/*` aliases

## Environment Setup

**Required Environment Variables:**
Create a `.env` file with:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Supabase Database Schema:**
```sql
-- Articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  content TEXT,
  description TEXT,
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMP,
  domain TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  reading_time INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Development Notes

**Authentication Flow:**
1. App initializes and checks for existing session
2. If no session, redirect to `(auth)/login`
3. After successful auth, redirect to `(tabs)` main app
4. Auth state persisted automatically by Supabase

**Article Management:**
- Articles stored in Supabase with real-time updates
- Metadata extraction happens client-side (can be moved to Edge Functions)
- Offline support with local state management
- Search and filtering implemented in Zustand store

**State Pattern:**
- Simple State Architecture with feature-based stores
- Each store handles its own domain (auth, articles, sync)
- Actions are co-located with state for better maintainability

## Testing Framework

Currently no testing setup is configured. The project uses Expo's default linting configuration but no test runner is present.