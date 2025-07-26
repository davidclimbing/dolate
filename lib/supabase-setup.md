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

## 5. Test Connection

After setting up, test the connection by running the app and trying to sign up/sign in.