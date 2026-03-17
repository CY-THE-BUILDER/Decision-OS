from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.models import NotificationSettings, NotificationSettingsPatch, UserContext
from app.services.supabase import SupabaseService

router = APIRouter(prefix="/settings/notifications", tags=["settings"])


@router.get("", response_model=NotificationSettings)
async def get_notification_settings(user: UserContext = Depends(get_current_user)) -> NotificationSettings:
    rows = await SupabaseService.list_rows(
        "notification_settings",
        user.access_token,
        {
            "workspace_id": f"eq.{user.workspace_id}",
            "select": "*",
            "limit": "1",
        },
    )
    return NotificationSettings(**rows[0])


@router.patch("", response_model=NotificationSettings)
async def patch_notification_settings(
    payload: NotificationSettingsPatch,
    user: UserContext = Depends(get_current_user),
) -> NotificationSettings:
    update_data = payload.model_dump(exclude_none=True)
    row = await SupabaseService.update_row(
        "notification_settings",
        user.access_token,
        {"workspace_id": user.workspace_id},
        update_data,
    )
    return NotificationSettings(**row)
