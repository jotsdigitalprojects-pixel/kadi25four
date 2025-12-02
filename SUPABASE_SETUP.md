# Supabase Setup Guide

Follow these steps to set up your Supabase backend for the Kadi multiplayer game.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Sign in with GitHub (recommended) or create an account
4. Click **"New project"**
5. Fill in the details:
   - **Name**: `kadi-game` (or any name you prefer)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Select **Free** (it's perfect for development)
6. Click **"Create new project"**
7. Wait ~2 minutes for the project to be provisioned

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, click **"Project Settings"** (gear icon in sidebar)
2. Click **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 3: Configure Environment Variables

1. Open your project folder
2. Edit the `.env.local` file (it's gitignored for security)
3. Add your credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the placeholder values with your actual credentials from Step 2.

## Step 4: Enable Google OAuth (Optional but Recommended)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list and click to expand
3. Enable it and add:
   - **Client ID**: Get from [Google Cloud Console](https://console.cloud.google.com/)
   - **Client Secret**: Get from Google Cloud Console
   
> **Note**: You can skip this for now and use Guest login only. Google OAuth can be added later.

## Step 5: Test the Connection

1. Make sure your dev server is running: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. You should see the login screen
4. Click **"Play as Guest"** to test anonymous authentication
5. If it works, you'll be redirected to the game setup screen!

## Troubleshooting

**Error: "Missing Supabase environment variables"**
- Make sure `.env.local` exists and has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after adding environment variables

**Google Sign-In not working**
- If you didn't set up OAuth, use "Play as Guest" instead
- Google OAuth requires additional setup in Google Cloud Console

## Next Steps

Once authentication is working, we'll add:
- Real-time game state synchronization
- Matchmaking system
- Friends and lobbies

**Note**: Never commit your `.env.local` file to Git. It contains sensitive API keys!
