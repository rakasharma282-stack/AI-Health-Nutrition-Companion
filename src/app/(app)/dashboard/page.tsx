"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Droplets,
  Moon,
  Dumbbell,
  TrendingUp,
  Utensils,
  Brain,
  MessageCircle,
  Camera,
  Soup,
  ShoppingCart,
} from "lucide-react";

interface DashData {
  profile: {
    dailyCalorieTarget: number | null;
    proteinTarget: number | null;
    carbTarget: number | null;
    fatTarget: number | null;
    name: string | null;
  } | null;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
    sleep: number;
    exerciseCalories: number;
  };
  meals: Array<{
    id: number;
    name: string;
    mealType: string;
    calories: number;
    source: string;
    photoUrl: string | null;
  }>;
  hasProfile: boolean;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-secondary">Loading dashboard…</div>
      </div>
    );
  }

  const target = data?.profile?.dailyCalorieTarget || 2000;
  const consumed = data?.totals?.calories || 0;
  const remaining = Math.max(0, target - consumed);
  const pct = Math.min(100, (consumed / target) * 100);

  const proteinTarget = data?.profile?.proteinTarget || 0;
  const carbTarget = data?.profile?.carbTarget || 0;
  const fatTarget = data?.profile?.fatTarget || 0;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          {greeting()}, {data?.profile?.name || "there"} 👋
        </h1>
        <p className="text-secondary">
          Here&apos;s your wellness overview for today
        </p>
      </div>

      {!data?.hasProfile && (
        <GlassCard className="border-l-4 border-[var(--accent)]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-primary">
                Complete your health profile
              </h3>
              <p className="text-sm text-secondary">
                Set your goals to unlock personalized calorie targets and AI plans.
              </p>
            </div>
            <Link
              href="/profile"
              className="btn-accent px-4 py-2 rounded-xl text-sm font-medium"
            >
              Set up profile
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Calorie overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard strong className="md:col-span-1 flex flex-col items-center justify-center">
          <CalorieRing consumed={consumed} target={target} />
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-primary">{remaining}</p>
            <p className="text-xs text-secondary">calories remaining</p>
          </div>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" /> Macro Breakdown
          </h3>
          <div className="space-y-4">
            <MacroBar
              label="Protein"
              consumed={data?.totals?.protein || 0}
              target={proteinTarget}
              color="bg-blue-500"
            />
            <MacroBar
              label="Carbs"
              consumed={data?.totals?.carbs || 0}
              target={carbTarget}
              color="bg-amber-500"
            />
            <MacroBar
              label="Fat"
              consumed={data?.totals?.fat || 0}
              target={fatTarget}
              color="bg-purple-500"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-2 text-center">
            <QuickStat
              icon={<Droplets className="w-4 h-4 text-blue-400" />}
              value={`${data?.totals?.water || 0}ml`}
              label="Water"
            />
            <QuickStat
              icon={<Moon className="w-4 h-4 text-indigo-400" />}
              value={`${data?.totals?.sleep || 0}h`}
              label="Sleep"
            />
            <QuickStat
              icon={<Flame className="w-4 h-4 text-red-400" />}
              value={`${data?.totals?.exerciseCalories || 0}`}
              label="Burned"
            />
          </div>
        </GlassCard>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction href="/meals" icon={<Utensils />} label="Log Meal" />
        <QuickAction href="/meals?tab=photo" icon={<Camera />} label="Photo Scan" />
        <QuickAction href="/coach" icon={<Brain />} label="AI Coach" />
        <QuickAction href="/chat" icon={<MessageCircle />} label="Ask AI" />
      </div>

      {/* Recent meals */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[var(--accent)]" /> Today&apos;s Meals
          </h3>
          <Link
            href="/meals"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            View all
          </Link>
        </div>
        {data?.meals?.length ? (
          <div className="space-y-2">
            {data.meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  {meal.photoUrl ? (
                    <img
                      src={meal.photoUrl}
                      alt={meal.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                      <Soup className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-primary text-sm">{meal.name}</p>
                    <div className="flex gap-2">
                      <Badge>{meal.mealType}</Badge>
                      {meal.source === "photo" && (
                        <Badge variant="accent">AI</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-semibold text-primary">
                  {Math.round(meal.calories)} cal
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Utensils className="w-10 h-10 mx-auto text-secondary mb-2 opacity-50" />
            <p className="text-secondary text-sm">No meals logged yet today</p>
            <Link
              href="/meals"
              className="text-sm text-[var(--accent)] hover:underline mt-1 inline-block"
            >
              Log your first meal
            </Link>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function CalorieRing({
  consumed,
  target,
}: {
  consumed: number;
  target: number;
}) {
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(1, target > 0 ? consumed / target : 0);
  const offset = circ * (1 - pct);

  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="var(--border-subtle)"
        strokeWidth="12"
      />
      <circle
        className="progress-ring-circle"
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
      <text
        x="90"
        y="85"
        textAnchor="middle"
        className="fill-[var(--text-primary)] font-bold"
        style={{ fontSize: 32 }}
      >
        {Math.round(consumed)}
      </text>
      <text
        x="90"
        y="108"
        textAnchor="middle"
        className="fill-[var(--text-secondary)]"
        style={{ fontSize: 13 }}
      >
        of {target} cal
      </text>
    </svg>
  );
}

function MacroBar({
  label,
  consumed,
  target,
  color,
}: {
  label: string;
  consumed: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-primary font-medium">{label}</span>
        <span className="text-secondary">
          {Math.round(consumed)} / {Math.round(target)}g
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuickStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="font-semibold text-primary">{value}</p>
      <p className="text-xs text-secondary">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="glass p-4 rounded-xl flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform"
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)]">
        {icon}
      </div>
      <span className="text-sm font-medium text-primary">{label}</span>
    </Link>
  );
}
