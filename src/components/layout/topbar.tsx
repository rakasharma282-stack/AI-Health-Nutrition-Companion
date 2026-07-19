"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, Soup } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const mobileNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/meals", label: "Meals" },
  { href: "/coach", label: "Coach" },
  { href: "/fitness", label: "Fitness" },
  { href: "/progress", label: "Progress" },
  { href: "/chat", label: "Assistant" },
  { href: "/recipes", label: "Recipes" },
  { href: "/grocery", label: "Grocery" },
  { href: "/wellness", label: "Wellness" },
  { href: "/profile", label: "Profile" },
];

export function Topbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-3 md:px-0">
      <div className="glass m-3 px-4 py-3 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white">
              <Soup className="w-5 h-5" />
            </div>
            <span className="font-bold text-primary">NutriAI</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-primary leading-tight">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-secondary">
              {session?.user?.role?.toLowerCase()}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-sm">
            {(session?.user?.name?.[0] || "U").toUpperCase()}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden glass m-3 p-3 rounded-2xl flex flex-col gap-1 animate-fade-in-up">
          {mobileNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-secondary hover:bg-black/5 dark:hover:bg-white/10",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
