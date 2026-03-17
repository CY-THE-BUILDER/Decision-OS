"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, ListTodo, Settings, Sparkles } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/today", label: "Today", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname.startsWith("/login");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-6 md:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky">Decision OS</p>
          <h1 className="text-3xl font-semibold">From brain dump to Strategic 3</h1>
        </div>
        {!isAuth ? (
          <Link href="/login" className="rounded-full bg-ink px-4 py-2 text-sm text-white">
            Account
          </Link>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      {!isAuth ? (
        <nav className="fixed bottom-4 left-1/2 flex w-[min(92vw,32rem)] -translate-x-1/2 justify-between rounded-full border border-white/60 bg-white/80 px-3 py-2 shadow-lg backdrop-blur">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex min-w-16 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs transition",
                  active ? "bg-ink text-white" : "text-ink/65"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
