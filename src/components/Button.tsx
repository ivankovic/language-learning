import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-sky-500 text-slate-950 hover:bg-sky-400",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  ghost: "bg-transparent text-slate-300 hover:bg-slate-900",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
