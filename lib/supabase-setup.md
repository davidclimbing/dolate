# Supabase Setup Guide for Dolate

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

## 2. Environment Variables

Create `.env` file in root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Database Schema

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  content TEXT,
  description TEXT,
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  domain TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  reading_time INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Enable RLS on tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for articles
CREATE POLICY "Users can view their own articles" 
  ON articles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own articles" 
  ON articles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles" 
  ON articles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles" 
  ON articles FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for tags
CREATE POLICY "Users can view their own tags" 
  ON tags FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags" 
  ON tags FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" 
  ON tags FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" 
  ON tags FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX articles_user_id_idx ON articles(user_id);
CREATE INDEX articles_created_at_idx ON articles(created_at DESC);
CREATE INDEX articles_is_read_idx ON articles(is_read);
CREATE INDEX articles_is_favorite_idx ON articles(is_favorite);
CREATE INDEX articles_domain_idx ON articles(domain);
CREATE INDEX tags_user_id_idx ON tags(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at 
  BEFORE UPDATE ON articles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4. Enable Realtime (Optional)

```sql
-- Enable realtime for articles table
ALTER PUBLICATION supabase_realtime ADD TABLE articles;
```

## 5. Authentication Configuration

### Important Authentication Settings

1. **Go to Authentication → Settings in your Supabase dashboard**

2. **Configure Email Settings:**
```
General Settings:
✓ Enable email confirmations: ON
✓ Enable secure email change: ON  
✓ Double confirm email changes: OFF (optional)

Password Settings:
✓ Minimum password length: 8 characters
✓ Require uppercase: OFF (handled by app validation)
✓ Require lowercase: OFF (handled by app validation)
✓ Require numbers: OFF (handled by app validation)
✓ Require special characters: OFF (handled by app validation)
```

3. **Security Settings:**
```
Rate Limiting:
- Email auth requests: 50 per hour
- SMS auth requests: 30 per hour (if using SMS)
- Email OTP requests: 10 per hour

JWT Settings:
- JWT expiry: 3600 seconds (1 hour)
- Refresh token rotation: ON
```

4. **Site URL Configuration:**
```
Site URL: http://localhost:8081 (for development)
          https://your-domain.com (for production)

Additional Redirect URLs:
- exp://localhost:8081 (for Expo development)
- your-app-scheme://login (for mobile deep linking)
```

### Email Templates (Optional)

Customize email templates in Authentication → Email Templates:

1. **Confirm signup template** - Welcome new users
2. **Reset password template** - Password reset instructions  
3. **Change email template** - Email change confirmation

## 6. Environment Variables

Make sure your `.env` file contains valid Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get these values:**
1. Go to your Supabase project dashboard
2. Click on Settings → API
3. Copy the Project URL and anon/public key

## 7. Test the Signup Flow

After setting up, test the connection:

1. Run `bun run web` or `expo start`
2. Navigate to the signup screen
3. Try creating an account with a valid email
4. Check your email for the confirmation link
5. Verify the account and test login

**Expected Flow:**
1. User fills signup form → App validates input
2. App calls Supabase signup → Supabase sends confirmation email
3. User clicks email link → Account confirmed
4. User can now sign in → Session created