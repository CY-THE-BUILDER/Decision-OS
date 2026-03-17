from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from app.core.config import settings


class LocalStore:
    FILE_PATH = Path(settings.data_dir) / "demo-store.json"

    @classmethod
    def _default_state(cls) -> dict[str, Any]:
        workspace_id = "demo-workspace"
        user_id = "demo-user"
        return {
            "workspace_members": [
                {
                    "workspace_id": workspace_id,
                    "user_id": user_id,
                    "role": "owner",
                    "created_at": datetime.utcnow().isoformat(),
                }
            ],
            "captures": [],
            "tasks": [],
            "decisions": [],
            "decision_items": [],
            "notification_settings": [
                {
                    "workspace_id": workspace_id,
                    "enabled": False,
                    "channel": "email",
                    "time_of_day": "09:00:00",
                    "frequency": "weekdays",
                    "timezone": settings.timezone,
                    "updated_at": datetime.utcnow().isoformat(),
                }
            ],
        }

    @classmethod
    def _ensure_file(cls) -> None:
        cls.FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        if not cls.FILE_PATH.exists():
            cls.FILE_PATH.write_text(json.dumps(cls._default_state(), indent=2), encoding="utf-8")

    @classmethod
    def read(cls) -> dict[str, Any]:
        cls._ensure_file()
        return json.loads(cls.FILE_PATH.read_text(encoding="utf-8"))

    @classmethod
    def write(cls, data: dict[str, Any]) -> None:
        cls.FILE_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")

    @classmethod
    def list_rows(cls, table: str, filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        data = cls.read()
        rows = list(data.get(table, []))
        filters = filters or {}

        for key, value in filters.items():
          if value is None or key in {"select", "order", "limit"}:
              continue
          if isinstance(value, str) and value.startswith("eq."):
              target = value[3:]
              rows = [row for row in rows if str(row.get(key)) == target]
          elif isinstance(value, str) and value.startswith("not.eq."):
              target = value[7:]
              rows = [row for row in rows if str(row.get(key)) != target]

        order = filters.get("order")
        if order:
            field = str(order).split(".")[0].split(",")[0]
            rows = sorted(rows, key=lambda row: row.get(field) or "", reverse="desc" in str(order))

        limit = filters.get("limit")
        if limit:
            rows = rows[: int(limit)]
        return rows

    @classmethod
    def insert_row(cls, table: str, payload: dict[str, Any]) -> dict[str, Any]:
        data = cls.read()
        row = {
            "id": payload.get("id", str(uuid4())),
            "created_at": payload.get("created_at", datetime.utcnow().isoformat()),
            "updated_at": payload.get("updated_at", datetime.utcnow().isoformat()),
            **payload,
        }
        data.setdefault(table, []).append(row)
        cls.write(data)
        return row

    @classmethod
    def update_row(cls, table: str, match: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any] | None:
        data = cls.read()
        rows = data.get(table, [])
        for index, row in enumerate(rows):
            if all(str(row.get(key)) == str(value) for key, value in match.items()):
                next_row = {
                    **row,
                    **payload,
                    "updated_at": datetime.utcnow().isoformat(),
                }
                rows[index] = next_row
                cls.write(data)
                return next_row
        return None
