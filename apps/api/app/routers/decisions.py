from datetime import date

from fastapi import APIRouter, Depends, Query

from app.core.auth import get_current_user
from app.models import Decision, DecisionItem, Task, UserContext
from app.services.llm import LLMService
from app.services.supabase import SupabaseService

router = APIRouter(prefix="/decisions", tags=["decisions"])


async def _hydrate_decision(decision_id: str, token: str) -> Decision:
    decisions = await SupabaseService.list_rows(
        "decisions",
        token,
        {"id": f"eq.{decision_id}", "select": "*", "limit": "1"},
    )
    items = await SupabaseService.list_rows(
        "decision_items",
        token,
        {"decision_id": f"eq.{decision_id}", "select": "*", "order": "rank.asc"},
    )
    tasks_by_id: dict[str, Task] = {}
    task_ids = [item["task_id"] for item in items]
    if task_ids:
        tasks = await SupabaseService.list_rows(
            "tasks",
            token,
            {
                "id": f"in.({','.join(task_ids)})",
                "select": "*",
            },
        )
        tasks_by_id = {task["id"]: Task(**task) for task in tasks}

    return Decision(
        id=decisions[0]["id"],
        decision_date=decisions[0]["decision_date"],
        created_at=decisions[0]["created_at"],
        items=[
            DecisionItem(
                rank=item["rank"],
                task=tasks_by_id[item["task_id"]],
                reason=item.get("reason"),
                risk_if_not_doing=item.get("risk_if_not_doing"),
            )
            for item in items
            if item["task_id"] in tasks_by_id
        ],
    )


@router.get("", response_model=Decision | None)
async def get_decision(
    date_value: date = Query(alias="date"),
    user: UserContext = Depends(get_current_user),
) -> Decision | None:
    rows = await SupabaseService.list_rows(
        "decisions",
        user.access_token,
        {
            "workspace_id": f"eq.{user.workspace_id}",
            "decision_date": f"eq.{date_value.isoformat()}",
            "select": "*",
            "order": "created_at.desc",
            "limit": "1",
        },
    )
    if not rows:
        return None
    return await _hydrate_decision(rows[0]["id"], user.access_token)


@router.post("/generate", response_model=Decision)
async def generate_decision(
    date_value: date = Query(alias="date"),
    user: UserContext = Depends(get_current_user),
) -> Decision:
    task_rows = await SupabaseService.list_rows(
        "tasks",
        user.access_token,
        {
            "workspace_id": f"eq.{user.workspace_id}",
            "status": "not.eq.done",
            "select": "*",
            "order": "priority.desc,created_at.asc",
        },
    )
    tasks = [Task(**row) for row in task_rows]
    candidates = await LLMService.rank_tasks(tasks, date_value)

    decision = await SupabaseService.insert_row(
        "decisions",
        user.access_token,
        {
            "workspace_id": user.workspace_id,
            "created_by": user.id,
            "decision_date": date_value.isoformat(),
            "model": "heuristic-mvp",
            "input_snapshot": {"task_count": len(tasks)},
        },
    )

    for index, candidate in enumerate(candidates, start=1):
        await SupabaseService.insert_row(
            "decision_items",
            user.access_token,
            {
                "decision_id": decision["id"],
                "rank": index,
                "task_id": candidate.task_id,
                "reason": candidate.reason,
                "risk_if_not_doing": candidate.risk_if_not_doing,
            },
        )

    return await _hydrate_decision(decision["id"], user.access_token)
