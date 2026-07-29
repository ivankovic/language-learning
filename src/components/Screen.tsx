import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useT } from "../i18n/useT";

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
    <div className="min-h-dvh bg-slate-50 pb-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100 fun:bg-gradient-to-b fun:from-amber-50 fun:via-sky-50 fun:to-pink-50 dark:fun:from-slate-950 dark:fun:via-slate-900 dark:fun:to-slate-950">
      <header className="flex items-center justify-between px-4 pt-6 pb-3">
        <h1 className="text-xl font-semibold fun:text-2xl fun:font-extrabold">{title}</h1>
        {action}
      </header>
      <main className="px-4">{children}</main>
    </div>
  );
}

export function SettingsLink() {
  const t = useT();
  return (
    <Link
      to="/settings"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-lg dark:bg-slate-900"
      aria-label={t("common.settings")}
    >
      ⚙️
    </Link>
  );
}
