import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-sky-500 text-slate-950 hover:bg-sky-400 fun:bg-gradient-to-br fun:from-amber-400 fun:to-pink-500 fun:text-white fun:hover:from-amber-300 fun:hover:to-pink-400",
  secondary:
    "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 fun:bg-sky-100 fun:text-sky-900 dark:fun:bg-slate-800 dark:fun:text-sky-100",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-40 fun:rounded-full fun:font-bold fun:shadow-md fun:active:scale-95 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
