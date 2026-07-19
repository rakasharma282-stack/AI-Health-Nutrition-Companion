"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "accent" | "ghost" | "outline" | "danger";
  children: ReactNode;
}

export function Button({
  variant = "accent",
  className,
  children,
  ...props
}: ButtonProps) {
  const variants: Record<string, string> = {
    accent: "btn-accent font-medium",
    ghost: "hover:bg-black/5 dark:hover:bg-white/10 transition-colors",
    outline:
      "border border-[var(--glass-border)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors",
    danger:
      "bg-[var(--danger)] text-white hover:opacity-90 transition-opacity font-medium",
  };

  return (
    <button
      className={cn(
        "px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
