"use client";

import { useEffect, useState, useTransition } from "react";
import { api } from "@/lib/api";
import { Task } from "@/lib/types";
import { Card, Pill } from "@/components/ui";

const statuses = ["all", "new", "in_progress", "done", "archived"] as const;
const categories = ["all", "work", "life", "finance", "health", "side_project", "other"] as const;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Task>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      void (async () => {
        const params = new URLSearchParams();
        if (status !== "all") params.set("status", status);
        if (category !== "all") params.set("category", category);
        try {
          setTasks(await api.listTasks(params));
        } catch {
          setTasks([]);
        }
      })();
    });
  }, [status, category]);

  async function toggleTask(task: Task) {
    const updated = await api.patchTask(task.id, {
      status: task.status === "done" ? "new" : "done"
    });
    setTasks((previous) => previous.map((item) => (item.id === task.id ? updated : item)));
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setDraft({
      title: task.title,
      category: task.category,
      due_date: task.due_date,
      effort_minutes: task.effort_minutes,
      priority: task.priority
    });
  }

  async function saveTask(taskId: string) {
    const updated = await api.patchTask(taskId, draft);
    setTasks((previous) => previous.map((item) => (item.id === taskId ? updated : item)));
    setEditingId(null);
    setDraft({});
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky">Task Review</p>
          <h2 className="mt-2 text-2xl font-semibold">Edit AI output until the list feels trustworthy</h2>
        </div>
        <div className="flex gap-3">
          <select className="rounded-2xl border border-slate-200 px-4 py-3" value={status} onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])}>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="rounded-2xl border border-slate-200 px-4 py-3" value={category} onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Pill>{task.category}</Pill>
                {task.needs_review ? <Pill tone="warn">needs review</Pill> : null}
                {task.status === "done" ? <Pill tone="success">done</Pill> : null}
              </div>
              {editingId === task.id ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                    value={draft.title ?? ""}
                    onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                  />
                  <select
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                    value={draft.category ?? task.category}
                    onChange={(event) => setDraft((previous) => ({ ...previous, category: event.target.value as Task["category"] }))}
                  >
                    {categories.filter((item) => item !== "all").map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <input
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                    type="date"
                    value={draft.due_date ?? ""}
                    onChange={(event) => setDraft((previous) => ({ ...previous, due_date: event.target.value || null }))}
                  />
                  <select
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                    value={draft.effort_minutes ?? task.effort_minutes}
                    onChange={(event) => setDraft((previous) => ({ ...previous, effort_minutes: Number(event.target.value) }))}
                  >
                    {[5, 15, 30, 60, 120].map((value) => <option key={value} value={value}>{value} min</option>)}
                  </select>
                  <select
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                    value={draft.priority ?? task.priority}
                    onChange={(event) => setDraft((previous) => ({ ...previous, priority: Number(event.target.value) }))}
                  >
                    {[0, 1, 2, 3].map((value) => <option key={value} value={value}>priority {value}</option>)}
                  </select>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-sm text-slate-500">
                    {task.effort_minutes} min · priority {task.priority} · confidence {(task.confidence * 100).toFixed(0)}%
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {editingId === task.id ? (
                <>
                  <button className="rounded-2xl bg-ink px-4 py-3 text-white" onClick={() => saveTask(task.id)}>
                    Save
                  </button>
                  <button className="rounded-2xl border border-slate-300 px-4 py-3" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className="rounded-2xl border border-slate-300 px-4 py-3" onClick={() => startEdit(task)}>
                  Edit
                </button>
              )}
              <button className="rounded-2xl bg-ink px-4 py-3 text-white" onClick={() => toggleTask(task)} disabled={isPending}>
                {task.status === "done" ? "Restore" : "Complete"}
              </button>
            </div>
          </Card>
        ))}
        {!tasks.length ? <p className="text-sm text-slate-500">No tasks matched this filter.</p> : null}
      </div>
    </div>
  );
}
