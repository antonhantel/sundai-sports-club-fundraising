# Supabase Setup Guide

This project uses Supabase for authentication and database storage. Follow these steps to set up Supabase for local development.

## 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `sundai-sports-club-fundraising` (or your preferred name)
   - Database Password: Choose a strong password (save this!)
   - Region: Choose the closest region to you
5. Wait for the project to be created (takes ~2 minutes)

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## 3. Set Up Environment Variables

1. Create a `.env.local` file in the root of this project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the placeholder values with your actual Supabase credentials

## 4. Run the Database Migrations

You need to run two migration files in order:

### Step 1: Main Migration
1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-migration.sql` from this project
4. Click "Run" to execute the migration
5. This will create all the necessary tables, indexes, and triggers

### Step 2: RLS Policies Migration
1. Still in **SQL Editor**, click "New Query" again
2. Copy and paste the contents of `supabase-rls-policies.sql` from this project
3. Click "Run" to execute the migration
4. This will enable Row Level Security and create all security policies

**Note:** The RLS policies migration is idempotent - you can run it multiple times safely if you need to update policies.

## 5. Configure Email Authentication

1. In your Supabase project dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Optionally configure email templates under **Authentication** → **Email Templates**

## 6. Test the Setup

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000`
3. Click "Sign in" and try creating a new account
4. After signing up, you should be redirected to the onboarding page
5. Complete the onboarding to create your team

## Troubleshooting

### "Unauthorized" errors
- Make sure your `.env.local` file has the correct Supabase URL and anon key
- Restart your development server after adding environment variables

### Database errors
- Make sure you've run the migration SQL script
- Check the Supabase dashboard → **Database** → **Tables** to verify tables were created

### Authentication not working
- Check **Authentication** → **Users** in Supabase dashboard to see if users are being created
- Verify email provider is enabled in **Authentication** → **Providers**

## Database Schema

The migration creates the following tables:
- `teams` - Stores team information
- `leads` - Stores potential sponsor leads
- `outreach_drafts` - Stores email drafts and proposals
- `assets` - Stores generated assets (proposals, jersey mockups, logos)

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.
