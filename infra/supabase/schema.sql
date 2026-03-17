create extension if not exists "uuid-ossp";

do $$ begin
  create type task_status as enum ('new','in_progress','done','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type capture_source as enum ('manual','voice','email','slack','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_category as enum ('work','life','finance','health','side_project','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notify_frequency as enum ('daily','weekdays');
exception when duplicate_object then null; end $$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.captures (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  source capture_source not null default 'manual',
  raw_text text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_capture_id uuid references public.captures(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category task_category not null default 'other',
  status task_status not null default 'new',
  due_date date,
  effort_minutes int not null default 15,
  priority int not null default 1,
  confidence numeric(4,3) not null default 0.0,
  needs_review boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_workspace_status on public.tasks(workspace_id, status);
create index if not exists idx_tasks_due_date on public.tasks(workspace_id, due_date);

create table if not exists public.decisions (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  decision_date date not null,
  model text,
  input_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists ux_decisions_workspace_date_latest
on public.decisions(workspace_id, decision_date, created_at);

create table if not exists public.decision_items (
  decision_id uuid not null references public.decisions(id) on delete cascade,
  rank int not null,
  task_id uuid not null references public.tasks(id) on delete cascade,
  reason text,
  risk_if_not_doing text,
  primary key (decision_id, rank)
);

create table if not exists public.notification_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  enabled boolean not null default false,
  channel text not null default 'email',
  time_of_day time not null default '09:00',
  frequency notify_frequency not null default 'weekdays',
  timezone text not null default 'Asia/Taipei',
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  run_after timestamptz not null default now(),
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
