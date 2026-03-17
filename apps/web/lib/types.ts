export type Capture = {
  id: string;
  raw_text: string;
  source: "manual" | "voice" | "email" | "slack" | "other";
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  category: "work" | "life" | "finance" | "health" | "side_project" | "other";
  status: "new" | "in_progress" | "done" | "archived";
  due_date: string | null;
  effort_minutes: number;
  priority: number;
  confidence: number;
  needs_review: boolean;
  notes: string | null;
};

export type Decision = {
  id: string;
  decision_date: string;
  items: Array<{
    rank: number;
    reason: string | null;
    risk_if_not_doing: string | null;
    task: Task;
  }>;
};

export type NotificationSettings = {
  workspace_id: string;
  enabled: boolean;
  channel: string;
  time_of_day: string;
  frequency: "daily" | "weekdays";
  timezone: string;
};
