"use client";

import { useEffect, useState, useTransition } from "react";
import { api } from "@/lib/api";
import { Capture } from "@/lib/types";
import { Card, Pill } from "@/components/ui";

export default function InboxPage() {
  const [text, setText] = useState("");
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      void (async () => {
        try {
          setCaptures(await api.listCaptures());
        } catch {
          setCaptures([]);
        }
      })();
    });
  }, []);

  async function handleCreateCapture() {
    if (!text.trim()) return;
    const created = await api.createCapture({ raw_text: text, source: "manual" });
    setCaptures((previous) => [created, ...previous]);
    setText("");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-coral">Unified Inbox</p>
          <h2 className="mt-2 text-2xl font-semibold">Drop in raw thought, meeting note, or voice transcript</h2>
        </div>
        <textarea
          className="min-h-56 w-full rounded-3xl border border-slate-200 bg-sand px-5 py-4 outline-none"
          placeholder="Paste anything messy here. Decision OS will turn it into tasks."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button className="rounded-2xl bg-coral px-4 py-3 text-white" onClick={handleCreateCapture} disabled={isPending}>
          Create Capture
        </button>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Captures</h3>
          <Pill>{captures.length} items</Pill>
        </div>
        <div className="space-y-3">
          {captures.map((capture) => (
            <article key={capture.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <Pill>{capture.source}</Pill>
                <span className="text-xs text-slate-500">{new Date(capture.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm leading-6 text-slate-700">{capture.raw_text}</p>
            </article>
          ))}
          {!captures.length ? <p className="text-sm text-slate-500">No captures yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
