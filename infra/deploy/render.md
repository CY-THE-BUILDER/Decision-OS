# Render API Deploy

## Service Settings

- Runtime: Docker
- Dockerfile: `infra/deploy/Dockerfile.api`
- Health Check Path: `/health`

## Required Environment Variables

- `APP_ENV=production`
- `APP_VERSION=0.1.0`
- `APP_BASE_URL`
- `CORS_ORIGINS`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_AUDIENCE=authenticated`
- `OPENAI_API_KEY`
- `SENDGRID_API_KEY`
- `EMAIL_FROM`

## Notes

- Production boot will fail fast if core Supabase variables are missing.
- Point `APP_BASE_URL` and `CORS_ORIGINS` at the public Vercel frontend origin.
