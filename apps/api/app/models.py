from datetime import date, datetime, time
from typing import Any, Literal

from pydantic import BaseModel, Field


CaptureSource = Literal["manual", "voice", "email", "slack", "other"]
TaskCategory = Literal["work", "life", "finance", "health", "side_project", "other"]
TaskStatus = Literal["new", "in_progress", "done", "archived"]
NotifyFrequency = Literal["daily", "weekdays"]


class UserContext(BaseModel):
    id: str
    email: str | None = None
    workspace_id: str
    access_token: str


class CaptureCreate(BaseModel):
    raw_text: str = Field(min_length=1)
    source: CaptureSource = "manual"
    metadata: dict[str, Any] = Field(default_factory=dict)


class Capture(BaseModel):
    id: str
    workspace_id: str
    created_by: str
    raw_text: str
    source: CaptureSource
    metadata: dict[str, Any]
    created_at: datetime


class ExtractedTask(BaseModel):
    title: str
    category: TaskCategory = "other"
    due_date: date | None = None
    effort_minutes: Literal[5, 15, 30, 60, 120] = 15
    confidence: float = 0.0
    notes: str | None = None


class Task(BaseModel):
    id: str
    title: str
    category: TaskCategory
    status: TaskStatus
    due_date: date | None = None
    effort_minutes: int
    priority: int
    confidence: float
    needs_review: bool
    notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class TaskPatch(BaseModel):
    title: str | None = None
    category: TaskCategory | None = None
    status: TaskStatus | None = None
    due_date: date | None = None
    effort_minutes: int | None = None
    priority: int | None = None
    notes: str | None = None


class DecisionCandidate(BaseModel):
    task_id: str
    reason: str
    risk_if_not_doing: str | None = None


class DecisionItem(BaseModel):
    rank: int
    task: Task
    reason: str | None = None
    risk_if_not_doing: str | None = None


class Decision(BaseModel):
    id: str
    decision_date: date
    items: list[DecisionItem]
    created_at: datetime | None = None


class NotificationSettings(BaseModel):
    workspace_id: str
    enabled: bool = False
    channel: str = "email"
    time_of_day: time
    frequency: NotifyFrequency = "weekdays"
    timezone: str = "Asia/Taipei"
    updated_at: datetime | None = None


class NotificationSettingsPatch(BaseModel):
    enabled: bool | None = None
    time_of_day: str | None = None
    frequency: NotifyFrequency | None = None
    timezone: str | None = None


class MeResponse(BaseModel):
    id: str
    email: str | None = None
    workspace_id: str
    plan: str = "free"
