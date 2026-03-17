from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.services.local_store import LocalStore


class SupabaseService:
    @staticmethod
    def _headers(token: str, service_role: bool = False) -> dict[str, str]:
        bearer = settings.supabase_service_role_key if service_role else token
        api_key = settings.supabase_service_role_key if service_role else settings.supabase_anon_key
        return {
            "Authorization": f"Bearer {bearer}",
            "apikey": api_key,
            "Content-Type": "application/json",
        }

    @staticmethod
    async def _request(
        method: str,
        path: str,
        token: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any = None,
        service_role: bool = False,
    ) -> Any:
        url = f"{settings.supabase_url}/rest/v1/{path}"
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.request(
                method,
                url,
                headers=SupabaseService._headers(token, service_role=service_role),
                params=params,
                json=json,
            )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Supabase error on {path}: {response.text}",
            )
        if not response.text:
            return None
        return response.json()

    @staticmethod
    async def get_personal_workspace_id(token: str, user_id: str) -> str:
        if settings.demo_mode:
            return "demo-workspace"
        data = await SupabaseService._request(
            "GET",
            "workspace_members",
            token,
            params={
                "user_id": f"eq.{user_id}",
                "select": "workspace_id,role",
                "order": "created_at.asc",
                "limit": "1",
            },
        )
        if not data:
            raise HTTPException(status_code=404, detail="Workspace not found for user")
        return data[0]["workspace_id"]

    @staticmethod
    async def list_rows(path: str, token: str, params: dict[str, Any]) -> list[dict[str, Any]]:
        if settings.demo_mode:
            return LocalStore.list_rows(path, params)
        data = await SupabaseService._request("GET", path, token, params=params)
        return data or []

    @staticmethod
    async def insert_row(path: str, token: str, payload: dict[str, Any]) -> dict[str, Any]:
        if settings.demo_mode:
            return LocalStore.insert_row(path, payload)
        data = await SupabaseService._request(
            "POST",
            path,
            token,
            json=payload,
            params={"select": "*"},
        )
        return data[0]

    @staticmethod
    async def update_row(path: str, token: str, match: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
        if settings.demo_mode:
            row = LocalStore.update_row(path, match, payload)
            if not row:
                raise HTTPException(status_code=404, detail=f"{path} row not found")
            return row
        params = {"select": "*"}
        for key, value in match.items():
            params[key] = f"eq.{value}"
        data = await SupabaseService._request("PATCH", path, token, params=params, json=payload)
        if not data:
            raise HTTPException(status_code=404, detail=f"{path} row not found")
        return data[0]
