from fastapi import APIRouter, Depends, Query

from app.core.auth import get_current_user
from app.models import Task, TaskPatch, UserContext
from app.services.supabase import SupabaseService

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[Task])
async def list_tasks(
    status: str | None = Query(default=None),
    category: str | None = Query(default=None),
    user: UserContext = Depends(get_current_user),
) -> list[Task]:
    params = {
        "workspace_id": f"eq.{user.workspace_id}",
        "select": "*",
        "order": "created_at.desc",
    }
    if status:
        params["status"] = f"eq.{status}"
    if category:
        params["category"] = f"eq.{category}"

    rows = await SupabaseService.list_rows("tasks", user.access_token, params)
    return [Task(**row) for row in rows]


@router.patch("/{task_id}", response_model=Task)
async def patch_task(task_id: str, payload: TaskPatch, user: UserContext = Depends(get_current_user)) -> Task:
    row = await SupabaseService.update_row(
        "tasks",
        user.access_token,
        {"id": task_id, "workspace_id": user.workspace_id},
        payload.model_dump(exclude_none=True),
    )
    return Task(**row)
