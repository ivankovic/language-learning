import { NavLink } from "react-router-dom";
import { useT } from "../i18n/useT";

const tabs = [
  { to: "/", key: "tabs.home", icon: "🏠", end: true },
  { to: "/lessons", key: "tabs.lessons", icon: "📘", end: false },
  { to: "/journal", key: "tabs.journal", icon: "✍️", end: false },
  { to: "/progress", key: "tabs.progress", icon: "📈", end: false },
] as const;

export function BottomTabBar() {
  const t = useT();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-500"
            }`
          }
        >
          <span className="text-lg leading-none">{tab.icon}</span>
          {t(tab.key)}
        </NavLink>
      ))}
    </nav>
  );
}
