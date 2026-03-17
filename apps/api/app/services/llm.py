from __future__ import annotations

from datetime import date

from app.models import DecisionCandidate, ExtractedTask, Task


VALID_EFFORTS = [5, 15, 30, 60, 120]


class LLMService:
    @staticmethod
    async def extract_tasks(raw_text: str) -> list[ExtractedTask]:
        lines = [line.strip("-• \t") for line in raw_text.splitlines() if line.strip()]
        tasks: list[ExtractedTask] = []

        for line in lines[:8]:
            if len(line) < 4:
                continue
            lowered = line.lower()
            category = "work"
            if any(word in lowered for word in ["gym", "doctor", "sleep", "walk"]):
                category = "health"
            elif any(word in lowered for word in ["invoice", "budget", "tax", "bank"]):
                category = "finance"
            elif any(word in lowered for word in ["side project", "prototype", "ship app"]):
                category = "side_project"
            elif any(word in lowered for word in ["home", "buy", "call mom", "family"]):
                category = "life"

            effort = 15
            if len(line) > 100:
                effort = 60
            elif len(line) > 60:
                effort = 30

            confidence = 0.8 if any(token in lowered for token in ["todo", "need to", "follow up", "send", "finish"]) else 0.58
            tasks.append(
                ExtractedTask(
                    title=line[:120],
                    category=category,  # type: ignore[arg-type]
                    due_date=date.today() if "today" in lowered else None,
                    effort_minutes=effort if effort in VALID_EFFORTS else 15,  # type: ignore[arg-type]
                    confidence=confidence,
                    notes=None,
                )
            )

        return tasks

    @staticmethod
    async def rank_tasks(tasks: list[Task], today: date) -> list[DecisionCandidate]:
        open_tasks = [task for task in tasks if task.status != "done" and task.status != "archived"]

        def score(task: Task) -> tuple[int, int, int]:
            due_bonus = 100 if task.due_date and task.due_date <= today else 0
            review_penalty = -10 if task.needs_review else 0
            effort_bonus = 20 if task.effort_minutes <= 30 else 5
            return (task.priority * 100 + due_bonus + effort_bonus + review_penalty, -task.effort_minutes, 0)

        ranked = sorted(open_tasks, key=score, reverse=True)[:3]
        return [
            DecisionCandidate(
                task_id=task.id,
                reason=f"Priority {task.priority} with a manageable {task.effort_minutes}-minute scope.",
                risk_if_not_doing="Momentum drops and nearby commitments may slip." if task.due_date else None,
            )
            for task in ranked
        ]
