from fastapi import APIRouter, Depends, Query, status

from app.core.auth import get_current_user
from app.core.config import settings
from app.models import Capture, CaptureCreate, UserContext
from app.services.llm import LLMService
from app.services.supabase import SupabaseService

router = APIRouter(prefix="/captures", tags=["captures"])


@router.get("", response_model=list[Capture])
async def list_captures(
    limit: int = Query(default=20, ge=1, le=100),
    user: UserContext = Depends(get_current_user),
) -> list[Capture]:
    rows = await SupabaseService.list_rows(
        "captures",
        user.access_token,
        {
            "workspace_id": f"eq.{user.workspace_id}",
            "select": "*",
            "order": "created_at.desc",
            "limit": str(limit),
        },
    )
    return [Capture(**row) for row in rows]


@router.post("", response_model=Capture, status_code=status.HTTP_201_CREATED)
async def create_capture(payload: CaptureCreate, user: UserContext = Depends(get_current_user)) -> Capture:
    capture = await SupabaseService.insert_row(
        "captures",
        user.access_token,
        {
            "workspace_id": user.workspace_id,
            "created_by": user.id,
            "raw_text": payload.raw_text,
            "source": payload.source,
            "metadata": payload.metadata,
        },
    )

    extracted = await LLMService.extract_tasks(payload.raw_text)
    for item in extracted:
        await SupabaseService.insert_row(
            "tasks",
            user.access_token,
            {
                "workspace_id": user.workspace_id,
                "source_capture_id": capture["id"],
                "created_by": user.id,
                "title": item.title,
                "category": item.category,
                "status": "new",
                "due_date": item.due_date.isoformat() if item.due_date else None,
                "effort_minutes": item.effort_minutes,
                "priority": 1,
                "confidence": round(item.confidence, 3),
                "needs_review": item.confidence < settings.confidence_threshold,
                "notes": item.notes,
            },
        )

    return Capture(**capture)
