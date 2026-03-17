from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.models import MeResponse, UserContext

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=MeResponse)
async def get_me(user: UserContext = Depends(get_current_user)) -> MeResponse:
    return MeResponse(id=user.id, email=user.email, workspace_id=user.workspace_id)
