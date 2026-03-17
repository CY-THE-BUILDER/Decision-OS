import clsx from "clsx";
import { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={clsx("rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur", className)}>{children}</section>;
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "warn" | "success" }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "warn" && "bg-orange-100 text-orange-700",
        tone === "success" && "bg-emerald-100 text-emerald-700",
        tone === "default" && "bg-slate-100 text-slate-700"
      )}
    >
      {children}
    </span>
  );
}
