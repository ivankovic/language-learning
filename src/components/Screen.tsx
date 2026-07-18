import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function Screen({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-950 pb-20 text-slate-100">
      <header className="flex items-center justify-between px-4 pt-6 pb-3">
        <h1 className="text-xl font-semibold">{title}</h1>
        {action}
      </header>
      <main className="px-4">{children}</main>
    </div>
  );
}

export function SettingsLink() {
  return (
    <Link
      to="/settings"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-lg"
      aria-label="Settings"
    >
      ⚙️
    </Link>
  );
}
