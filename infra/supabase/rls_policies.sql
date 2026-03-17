alter table public.user_profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.captures enable row level security;
alter table public.tasks enable row level security;
alter table public.decisions enable row level security;
alter table public.decision_items enable row level security;
alter table public.notification_settings enable row level security;
alter table public.jobs enable row level security;

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

create policy "profile self access" on public.user_profiles
for all using (id = auth.uid()) with check (id = auth.uid());

create policy "workspace member read" on public.workspaces
for select using (public.is_workspace_member(id));

create policy "workspace owner insert" on public.workspaces
for insert with check (owner_user_id = auth.uid());

create policy "workspace member read members" on public.workspace_members
for select using (public.is_workspace_member(workspace_id));

create policy "workspace owner manage members" on public.workspace_members
for all using (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_user_id = auth.uid()
  )
);

create policy "captures member access" on public.captures
for all using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

create policy "tasks member access" on public.tasks
for all using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

create policy "decisions member access" on public.decisions
for all using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

create policy "decision items member access" on public.decision_items
for all using (
  exists (
    select 1
    from public.decisions d
    where d.id = decision_id and public.is_workspace_member(d.workspace_id)
  )
) with check (
  exists (
    select 1
    from public.decisions d
    where d.id = decision_id and public.is_workspace_member(d.workspace_id)
  )
);

create policy "notification settings member access" on public.notification_settings
for all using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "jobs member access" on public.jobs
for all using (workspace_id is null or public.is_workspace_member(workspace_id))
with check (workspace_id is null or public.is_workspace_member(workspace_id));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
  display_name_value text;
begin
  display_name_value := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));

  insert into public.user_profiles (id, display_name)
  values (new.id, display_name_value)
  on conflict (id) do nothing;

  insert into public.workspaces (name, owner_user_id)
  values (coalesce(display_name_value, 'Personal') || '''s Workspace', new.id)
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner')
  on conflict do nothing;

  insert into public.notification_settings (workspace_id)
  values (new_workspace_id)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
