# Release Checklist

## Before Deploy

- Create a Supabase project
- Apply `infra/supabase/schema.sql`
- Apply `infra/supabase/rls_policies.sql`
- Create an OpenAI API key
- Create a SendGrid API key if email is enabled
- Create Stripe test mode products and a price ID
- Set frontend callback URLs in Supabase Auth

## Web Deploy

- Set project root to `apps/web`
- Set `NEXT_PUBLIC_API_BASE_URL`
- Set `NEXT_PUBLIC_SUPABASE_URL`
- Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Set `NEXT_PUBLIC_STRIPE_PRICE_ID`

## API Deploy

- Deploy from `apps/api` or use `infra/deploy/Dockerfile.api`
- Set `APP_ENV=production`
- Set `APP_BASE_URL` to the public frontend URL
- Set `CORS_ORIGINS` to the frontend origin
- Set `SUPABASE_URL`
- Set `SUPABASE_ANON_KEY`
- Set `SUPABASE_SERVICE_ROLE_KEY`
- Set `OPENAI_API_KEY`
- Set `JWT_AUDIENCE=authenticated`

## Smoke Test

- `GET /health` returns `status=ok` and `demo_mode=false`
- Log in with Supabase email/password
- Create a capture
- Confirm extracted tasks appear
- Generate a decision for today
- Open Today page from the public web app
