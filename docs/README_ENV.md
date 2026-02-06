# Environment Variables Setup

This document explains how to configure environment variables for the application.

## Required Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
# Get these from: Supabase Dashboard > Project Settings > API

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Where to Find These Values

### Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and open your project
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **Never commit the service_role key to Git!** It bypasses Row Level Security.

## Google OAuth (Optional)

Google OAuth is configured in the **Supabase Dashboard**, not in environment variables:

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Add your Google OAuth Client ID and Secret there
3. See `docs/google-oauth-setup.md` for detailed instructions

## Vercel Deployment

When deploying to Vercel, add these environment variables in:
**Project Settings** → **Environment Variables**

Add all three variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Local Development

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your values
nano .env.local

# Start development server
pnpm dev
```

## Security Notes

- `.env.local` is in `.gitignore` and will never be committed
- Only `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only
