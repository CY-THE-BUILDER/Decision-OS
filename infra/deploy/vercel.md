# Vercel Web Deploy

## Project Settings

- Framework: Next.js
- Root Directory: `apps/web`
- Install Command: `npm install`
- Build Command: `npm run build`

## Required Environment Variables

- `NEXT_PUBLIC_APP_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PRICE_ID`

## Recommended Domain Settings

- Add your production domain in Vercel
- Set the same domain in Supabase Auth redirect URLs
