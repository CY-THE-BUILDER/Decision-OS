"use client";

import { FormEvent, useState } from "react";
import { authClient, isLocalDemoMode, isSupabaseConfigured } from "@/lib/supabase";
import { Card } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const action = mode === "login"
      ? authClient.signInWithPassword({ email, password })
      : authClient.signUp({ email, password, options: { data: { display_name: email.split("@")[0] } } });
    const { error } = await action;
    setMessage(
      error
        ? error.message
        : isSupabaseConfigured
          ? mode === "login"
            ? "Logged in."
            : "Check your inbox to confirm your account."
          : isLocalDemoMode
            ? "Demo mode active. You can use the app locally without real auth."
            : "Auth is not configured for production."
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky">Welcome</p>
          <h2 className="mt-2 text-2xl font-semibold">Sign in to your workspace</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="w-full rounded-2xl bg-ink px-4 py-3 text-white" type="submit">
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
        {isLocalDemoMode ? (
          <p className="rounded-2xl bg-sky/10 px-4 py-3 text-sm text-sky-900">
            Local demo mode is enabled because Supabase env vars are missing.
          </p>
        ) : null}
        <button className="text-sm text-sky" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </Card>
    </div>
  );
}
