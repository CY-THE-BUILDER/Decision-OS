"use client";

import { useEffect, useState, useTransition } from "react";
import { api } from "@/lib/api";
import { Decision } from "@/lib/types";
import { Card, Pill } from "@/components/ui";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function TodayPage() {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [date, setDate] = useState(todayString());
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      void (async () => {
        try {
          setDecision(await api.getDecision(date));
        } catch {
          setDecision(null);
        }
      })();
    });
  }, [date]);

  async function generate() {
    setDecision(await api.generateDecision(date));
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-coral">Decision Panel</p>
          <h2 className="mt-2 text-3xl font-semibold">Today&apos;s Strategic 3</h2>
          <p className="mt-2 max-w-2xl text-slate-600">Free users get one generation per day. Pro unlocks unlimited regenerations, notifications, and history.</p>
        </div>
        <div className="flex gap-3">
          <input className="rounded-2xl border border-slate-200 px-4 py-3" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <button className="rounded-2xl bg-ink px-4 py-3 text-white" onClick={generate} disabled={isPending}>
            Generate
          </button>
        </div>
      </Card>

      {decision ? (
        <div className="grid gap-4 md:grid-cols-3">
          {decision.items.map((item) => (
            <Card key={item.rank} className="space-y-4">
              <Pill>#{item.rank}</Pill>
              <div>
                <h3 className="text-xl font-semibold">{item.task.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.task.category} · {item.task.effort_minutes} min</p>
              </div>
              <p className="text-sm leading-6 text-slate-700">{item.reason}</p>
              {item.risk_if_not_doing ? <p className="text-sm text-orange-700">Risk: {item.risk_if_not_doing}</p> : null}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-slate-600">No decision exists for {date}. Generate one to reduce decision fatigue.</p>
        </Card>
      )}
    </div>
  );
}
