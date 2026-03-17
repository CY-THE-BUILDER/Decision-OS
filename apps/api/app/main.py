from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import captures, decisions, me, settings as notification_settings, tasks

cors_origin_list = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app = FastAPI(title=settings.app_name, version=settings.app_version, openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys([settings.app_base_url, *cors_origin_list])),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "env": settings.app_env,
    }


@app.get("/health")
async def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "env": settings.app_env,
        "demo_mode": settings.demo_mode,
        "version": settings.app_version,
    }


app.include_router(me.router, prefix="/api")
app.include_router(captures.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(decisions.router, prefix="/api")
app.include_router(notification_settings.router, prefix="/api")
