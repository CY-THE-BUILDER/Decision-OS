# Decision OS

Decision OS is a multi-user productivity MVP for turning messy captures into actionable tasks and a daily Strategic 3.

## Structure

- `apps/web`: Next.js 14 frontend
- `apps/api`: FastAPI backend
- `packages/shared`: shared TypeScript schemas and types
- `infra/supabase`: database schema and RLS policies
- `docs`: PRD, OpenAPI, prompts

## Local Development

### Web

```bash
cd apps/web
npm install
npm run dev
```

### API

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Demo Mode

If `SUPABASE_URL` is empty, the API automatically boots in local demo mode and persists data to `apps/api/data/demo-store.json`.

The web app also falls back to a no-auth local mode if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing.

## Verified Commands

```bash
cd apps/api
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000

cd apps/web
npm run lint
npm run build
npm run start -- --hostname 127.0.0.1 --port 3001
```

## Public Deployment

### Option 1: Vercel + Render/Railway

- Deploy `apps/web` to Vercel with root directory set to `apps/web`
- Deploy `apps/api` to Render, Railway, or Fly.io with `APP_ENV=production`
- Set `NEXT_PUBLIC_API_BASE_URL` to the public API origin plus `/api`
- Set `APP_BASE_URL` and `CORS_ORIGINS` to the real frontend origin
- Apply `infra/supabase/schema.sql` and `infra/supabase/rls_policies.sql` in Supabase
- In production, demo mode is disabled automatically if `SUPABASE_URL` is missing
- Follow [release-checklist.md](/Users/chungyintsai/Documents/Playground/decision-os/docs/release-checklist.md)
- Platform guides:
  [vercel.md](/Users/chungyintsai/Documents/Playground/decision-os/infra/deploy/vercel.md)
  [render.md](/Users/chungyintsai/Documents/Playground/decision-os/infra/deploy/render.md)

### Option 2: Docker

```bash
docker compose up --build
```

### Post-Deploy Smoke Test

```bash
API_BASE_URL=https://your-api-domain.com \
WEB_BASE_URL=https://your-web-domain.com \
bash infra/deploy/smoke_test.sh
```

## Environment

Copy `.env.example` and fill in your Supabase, OpenAI, Stripe, and email credentials.

For platform-specific deploys, use:

- [apps/api/.env.example](/Users/chungyintsai/Documents/Playground/decision-os/apps/api/.env.example)
- [apps/web/.env.example](/Users/chungyintsai/Documents/Playground/decision-os/apps/web/.env.example)
