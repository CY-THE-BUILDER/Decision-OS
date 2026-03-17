"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { NotificationSettings } from "@/lib/types";
import { Card } from "@/components/ui";

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    void api.getNotificationSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  async function update(partial: Partial<NotificationSettings>) {
    const next = await api.patchNotificationSettings(partial);
    setSettings(next);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <Card className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky">Notifications</p>
          <h2 className="mt-2 text-2xl font-semibold">Choose when Decision OS should nudge you</h2>
        </div>
        <label className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
          <span>Daily email reminder</span>
          <input type="checkbox" checked={settings?.enabled ?? false} onChange={(event) => update({ enabled: event.target.checked })} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-2xl border border-slate-200 px-4 py-3" type="time" value={settings?.time_of_day?.slice(0, 5) ?? "09:00"} onChange={(event) => update({ time_of_day: event.target.value })} />
          <select className="rounded-2xl border border-slate-200 px-4 py-3" value={settings?.frequency ?? "weekdays"} onChange={(event) => update({ frequency: event.target.value as NotificationSettings["frequency"] })}>
            <option value="daily">daily</option>
            <option value="weekdays">weekdays</option>
          </select>
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-coral">Plans</p>
        <div className="rounded-3xl bg-slate-950 p-5 text-white">
          <h3 className="text-xl font-semibold">Pro</h3>
          <p className="mt-2 text-sm text-white/70">Unlimited decision generations, reminder emails, and history review.</p>
          <button className="mt-4 rounded-2xl bg-coral px-4 py-3 text-white">Upgrade with Stripe</button>
        </div>
        <div className="rounded-3xl bg-slate-100 p-5">
          <h3 className="text-xl font-semibold">Free</h3>
          <p className="mt-2 text-sm text-slate-600">One decision generation per day.</p>
        </div>
      </Card>
    </div>
  );
}
