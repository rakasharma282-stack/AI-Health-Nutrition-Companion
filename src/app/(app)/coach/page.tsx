"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Sparkles, Clock, Flame, AlertCircle, ShoppingBasket } from "lucide-react";

interface MealPlanResult {
  meals: Array<{
    meal: string;
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes: string;
  planId?: number;
}

export default function CoachPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<MealPlanResult | null>(null);
  const [planType, setPlanType] = useState<"daily" | "weekly">("daily");

  async function generate() {
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const res = await fetch("/api/ai/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setPlan(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
          <Brain className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            AI Nutrition Coach
          </h1>
          <p className="text-secondary">
            Personalized meal plans based on your health profile
          </p>
        </div>
      </div>

      {/* Plan type selector + generate */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setPlanType("daily")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                planType === "daily"
                  ? "btn-accent"
                  : "glass text-secondary"
              }`}
            >
              Daily Plan
            </button>
            <button
              onClick={() => setPlanType("weekly")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                planType === "weekly"
                  ? "btn-accent"
                  : "glass text-secondary"
              }`}
            >
              Weekly Plan
            </button>
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating your plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {planType === "daily" ? "Daily" : "Weekly"} Plan
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </GlassCard>

      {plan && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GlassCard className="text-center py-4">
              <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xl font-bold text-primary">
                {Math.round(plan.totalCalories)}
              </p>
              <p className="text-xs text-secondary">Calories</p>
            </GlassCard>
            <GlassCard className="text-center py-4">
              <p className="text-xl font-bold text-blue-500">
                {Math.round(plan.totalProtein)}g
              </p>
              <p className="text-xs text-secondary">Protein</p>
            </GlassCard>
            <GlassCard className="text-center py-4">
              <p className="text-xl font-bold text-amber-500">
                {Math.round(plan.totalCarbs)}g
              </p>
              <p className="text-xs text-secondary">Carbs</p>
            </GlassCard>
            <GlassCard className="text-center py-4">
              <p className="text-xl font-bold text-purple-500">
                {Math.round(plan.totalFat)}g
              </p>
              <p className="text-xs text-secondary">Fat</p>
            </GlassCard>
          </div>

          {/* Meals */}
          <div className="space-y-3">
            {plan.meals.map((meal, i) => (
              <GlassCard key={i}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wide">
                      {meal.meal}
                    </span>
                    <h3 className="text-lg font-bold text-primary">
                      {meal.name}
                    </h3>
                    <p className="text-sm text-secondary mt-1">
                      {meal.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">
                      {Math.round(meal.calories)} cal
                    </p>
                    <p className="text-xs text-secondary">
                      P{Math.round(meal.protein)} · C{Math.round(meal.carbs)} · F{Math.round(meal.fat)}
                    </p>
                  </div>
                </div>
                {meal.ingredients.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-xs text-secondary mb-1.5 flex items-center gap-1">
                      <ShoppingBasket className="w-3 h-3" /> Ingredients
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.ingredients.map((ing, j) => (
                        <span
                          key={j}
                          className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/5 text-xs text-secondary"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>

          {/* Notes */}
          {plan.notes && (
            <GlassCard className="border-l-4 border-amber-400">
              <p className="text-sm text-secondary whitespace-pre-wrap">
                {plan.notes}
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {!plan && !loading && !error && (
        <GlassCard className="text-center py-16">
          <Brain className="w-12 h-12 mx-auto text-secondary opacity-40 mb-3" />
          <p className="text-secondary">
            Click &quot;Generate Plan&quot; to get your personalized meal plan.
          </p>
          <p className="text-xs text-secondary mt-1">
            Make sure your health profile is complete for best results.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
