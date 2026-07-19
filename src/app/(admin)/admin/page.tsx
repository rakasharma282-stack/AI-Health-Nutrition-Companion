"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  Crown,
  Activity,
  Utensils,
  Dumbbell,
  Brain,
  Soup,
  Database,
  Loader2,
} from "lucide-react";

interface AdminData {
  stats: {
    totalUsers: number;
    premiumUsers: number;
    activeThisWeek: number;
    totalMeals: number;
    totalFoodItems: number;
    totalMealPlans: number;
    totalExerciseLogs: number;
    totalRecipes: number;
  };
  recentUsers: Array<{
    id: number;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    _count: { mealLogs: number; exerciseLogs: number; mealPlans: number };
  }>;
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => {
        if (!r.ok) throw new Error("Access denied");
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <GlassCard className="text-center py-16">
          <Shield className="w-12 h-12 mx-auto text-red-400 mb-3" />
          <h2 className="text-xl font-bold text-primary">Access Denied</h2>
          <p className="text-secondary text-sm mt-1">
            You need admin privileges to view this page.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  const s = data.stats;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
          <Shield className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Admin Dashboard
          </h1>
          <p className="text-secondary">Platform overview & analytics</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-500" />}
          label="Total Users"
          value={s.totalUsers}
        />
        <StatCard
          icon={<Crown className="w-5 h-5 text-amber-500" />}
          label="Premium Members"
          value={s.premiumUsers}
        />
        <StatCard
          icon={<Activity className="w-5 h-5 text-green-500" />}
          label="Active This Week"
          value={s.activeThisWeek}
        />
        <StatCard
          icon={<Utensils className="w-5 h-5 text-orange-500" />}
          label="Meals Logged"
          value={s.totalMeals}
        />
        <StatCard
          icon={<Database className="w-5 h-5 text-purple-500" />}
          label="Food Items"
          value={s.totalFoodItems}
        />
        <StatCard
          icon={<Brain className="w-5 h-5 text-indigo-500" />}
          label="AI Meal Plans"
          value={s.totalMealPlans}
        />
        <StatCard
          icon={<Dumbbell className="w-5 h-5 text-red-500" />}
          label="Workouts Logged"
          value={s.totalExerciseLogs}
        />
        <StatCard
          icon={<Soup className="w-5 h-5 text-teal-500" />}
          label="Recipes Generated"
          value={s.totalRecipes}
        />
      </div>

      {/* User management */}
      <GlassCard>
        <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--accent)]" /> Recent Users
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-secondary border-b border-[var(--border-subtle)]">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4 text-center">Meals</th>
                <th className="pb-2 pr-4 text-center">Workouts</th>
                <th className="pb-2 pr-4 text-center">Plans</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border-subtle)] last:border-0">
                  <td className="py-3 pr-4 text-primary font-medium">{u.name || "—"}</td>
                  <td className="py-3 pr-4 text-secondary">{u.email}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={u.role === "ADMIN" ? "danger" : u.role === "PREMIUM" ? "accent" : "default"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-center text-secondary">{u._count.mealLogs}</td>
                  <td className="py-3 pr-4 text-center text-secondary">{u._count.exerciseLogs}</td>
                  <td className="py-3 pr-4 text-center text-secondary">{u._count.mealPlans}</td>
                  <td className="py-3 text-secondary text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <GlassCard className="text-center py-4">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-2xl font-bold text-primary">{value.toLocaleString()}</p>
      <p className="text-xs text-secondary">{label}</p>
    </GlassCard>
  );
}
