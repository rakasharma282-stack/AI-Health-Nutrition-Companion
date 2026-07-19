"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Utensils,
  Brain,
  Dumbbell,
  TrendingUp,
  MessageCircle,
  BookOpen,
  ShoppingCart,
  Settings,
  Shield,
  Soup,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meals", label: "Meals & Calories", icon: Utensils },
  { href: "/coach", label: "Nutrition Coach", icon: Brain },
  { href: "/fitness", label: "Fitness Planner", icon: Dumbbell },
  { href: "/progress", label: "Progress & Insights", icon: TrendingUp },
  { href: "/chat", label: "AI Assistant", icon: MessageCircle },
  { href: "/recipes", label: "Recipes", icon: Soup },
  { href: "/grocery", label: "Grocery Planner", icon: ShoppingCart },
  { href: "/wellness", label: "Wellness Hub", icon: BookOpen },
  { href: "/profile", label: "Profile & Goals", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 glass-strong m-3 mr-0 p-4 rounded-2xl sticky top-3 max-h-[calc(100vh-1.5rem)] overflow-y-auto">
      <Link href="/dashboard" className="flex items-center gap-2 mb-6 px-2">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white">
          <Soup className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold text-primary leading-tight">NutriAI</p>
          <p className="text-xs text-secondary">Health Companion</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md"
                    : "text-secondary hover:bg-black/5 dark:hover:bg-white/10 hover:text-primary",
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto pt-4 px-2">
        <p className="text-xs text-secondary leading-relaxed">
          ⚠️ Educational tool only. Not a substitute for medical advice.
        </p>
      </div>
    </aside>
  );
}
