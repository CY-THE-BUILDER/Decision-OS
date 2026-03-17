from typing import Any

import jwt
from fastapi import Header, HTTPException, status
from jwt import PyJWKClient

from app.core.config import settings
from app.models import UserContext
from app.services.supabase import SupabaseService


def _get_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    return authorization.split(" ", 1)[1]


async def get_current_user(authorization: str | None = Header(default=None)) -> UserContext:
    if settings.demo_mode:
        return UserContext(
            id="demo-user",
            email="demo@decision.local",
            workspace_id="demo-workspace",
            access_token="demo-token",
        )

    token = _get_bearer_token(authorization)
    jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"

    try:
        jwk_client = PyJWKClient(jwks_url)
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        payload: dict[str, Any] = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.jwt_audience,
        )
    except Exception as exc:  # pragma: no cover - network/config dependent
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        ) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    workspace_id = await SupabaseService.get_personal_workspace_id(token, user_id)
    return UserContext(
        id=user_id,
        email=payload.get("email"),
        workspace_id=workspace_id,
        access_token=token,
    )
