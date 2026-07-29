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
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs fun:gap-1 fun:py-2.5 fun:text-sm fun:font-bold ${
              isActive
                ? "text-sky-600 dark:text-sky-400 fun:text-white"
                : "text-slate-500 fun:text-slate-500 dark:fun:text-slate-400"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`text-lg leading-none fun:text-2xl fun:rounded-2xl fun:px-3 fun:py-1 ${
                  isActive ? "fun:bg-gradient-to-br fun:from-amber-400 fun:to-pink-500" : ""
                }`}
              >
                {tab.icon}
              </span>
              {t(tab.key)}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
