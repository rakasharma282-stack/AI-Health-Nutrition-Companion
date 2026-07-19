"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, User, Target, Activity, Heart } from "lucide-react";
import {
  ACTIVITY_LABELS,
  calculateBMI,
  bmiCategory,
} from "@/lib/nutrition";

interface ProfileData {
  user: { id: number; email: string; name: string | null; role: string };
  profile: {
    dateOfBirth: string | null;
    gender: string | null;
    heightCm: number | null;
    weightKg: number | null;
    activityLevel: string | null;
    dietType: string | null;
    allergies: string | null;
    goal: string | null;
    targetWeightKg: number | null;
    preferredCuisine: string | null;
    bmr: number | null;
    dailyCalorieTarget: number | null;
    proteinTarget: number | null;
    carbTarget: number | null;
    fatTarget: number | null;
  } | null;
}

export default function ProfilePage() {
  const params = useSearchParams();
  const isWelcome = params.get("welcome") === "1";
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "",
    dietType: "",
    allergies: "",
    goal: "",
    targetWeightKg: "",
    preferredCuisine: "",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setForm({
          name: d.user?.name || "",
          dateOfBirth: d.profile?.dateOfBirth
            ? new Date(d.profile.dateOfBirth).toISOString().slice(0, 10)
            : "",
          gender: d.profile?.gender || "",
          heightCm: d.profile?.heightCm?.toString() || "",
          weightKg: d.profile?.weightKg?.toString() || "",
          activityLevel: d.profile?.activityLevel || "",
          dietType: d.profile?.dietType || "",
          allergies: d.profile?.allergies || "",
          goal: d.profile?.goal || "",
          targetWeightKg: d.profile?.targetWeightKg?.toString() || "",
          preferredCuisine: d.profile?.preferredCuisine || "",
        });
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMessage("Profile saved! Your nutrition targets have been updated.");
      // Refresh data
      const refreshed = await fetch("/api/profile").then((r) => r.json());
      setData(refreshed);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-secondary">Loading profile…</div>
      </div>
    );
  }

  const p = data?.profile;
  const bmi =
    p?.heightCm && p?.weightKg
      ? calculateBMI(p.weightKg, p.heightCm)
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {isWelcome && (
        <div className="glass-strong p-5 rounded-2xl border-l-4 border-[var(--accent)]">
          <h2 className="text-xl font-bold text-primary mb-1">
            🎉 Welcome to NutriAI!
          </h2>
          <p className="text-secondary text-sm">
            Complete your health profile below to unlock personalized calorie
            targets, meal plans, and AI insights.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <User className="w-7 h-7 text-[var(--accent)]" />
        <div>
          <h1 className="text-2xl font-bold text-primary">Profile & Health Goals</h1>
          <p className="text-secondary text-sm">
            Your data powers personalized recommendations
          </p>
        </div>
      </div>

      {/* Targets summary */}
      {p?.dailyCalorieTarget && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GlassCard className="text-center">
            <Target className="w-5 h-5 mx-auto text-[var(--accent)] mb-1" />
            <p className="text-2xl font-bold text-primary">
              {Math.round(p.dailyCalorieTarget)}
            </p>
            <p className="text-xs text-secondary">Cal/day target</p>
          </GlassCard>
          <GlassCard className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {p.proteinTarget ? Math.round(p.proteinTarget) : "—"}g
            </p>
            <p className="text-xs text-secondary">Protein</p>
          </GlassCard>
          <GlassCard className="text-center">
            <p className="text-2xl font-bold text-amber-500">
              {p.carbTarget ? Math.round(p.carbTarget) : "—"}g
            </p>
            <p className="text-xs text-secondary">Carbs</p>
          </GlassCard>
          <GlassCard className="text-center">
            <p className="text-2xl font-bold text-purple-500">
              {p.fatTarget ? Math.round(p.fatTarget) : "—"}g
            </p>
            <p className="text-xs text-secondary">Fat</p>
          </GlassCard>
        </div>
      )}

      {bmi && (
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary">Body Mass Index</p>
            <p className="text-2xl font-bold text-primary">
              {bmi.toFixed(1)}{" "}
              <Badge
                variant={
                  bmiCategory(bmi) === "Healthy" ? "accent" : "warning"
                }
              >
                {bmiCategory(bmi)}
              </Badge>
            </p>
          </div>
          <Heart className="w-8 h-8 text-[var(--accent)]" />
        </GlassCard>
      )}

      <form onSubmit={handleSave}>
        <GlassCard className="space-y-5">
          {/* Basic info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={data?.user?.email || ""} disabled />
            </div>
          </div>

          <h3 className="font-semibold text-primary flex items-center gap-2 pt-2">
            <Activity className="w-4 h-4 text-[var(--accent)]" /> Body & Health
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={form.heightCm}
                onChange={(e) =>
                  setForm({ ...form, heightCm: e.target.value })
                }
                placeholder="170"
              />
            </div>
            <div>
              <Label>Current Weight (kg)</Label>
              <Input
                type="number"
                value={form.weightKg}
                onChange={(e) =>
                  setForm({ ...form, weightKg: e.target.value })
                }
                placeholder="70"
              />
            </div>
            <div>
              <Label>Target Weight (kg)</Label>
              <Input
                type="number"
                value={form.targetWeightKg}
                onChange={(e) =>
                  setForm({ ...form, targetWeightKg: e.target.value })
                }
                placeholder="65"
              />
            </div>
            <div>
              <Label>Activity Level</Label>
              <Select
                value={form.activityLevel}
                onChange={(e) =>
                  setForm({ ...form, activityLevel: e.target.value })
                }
              >
                <option value="">Select…</option>
                {(Object.entries(ACTIVITY_LABELS) as [string, string][]).map(
                  ([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ),
                )}
              </Select>
            </div>
          </div>

          <h3 className="font-semibold text-primary flex items-center gap-2 pt-2">
            <Target className="w-4 h-4 text-[var(--accent)]" /> Diet & Goals
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Primary Goal</Label>
              <Select
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              >
                <option value="">Select…</option>
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Muscle</option>
              </Select>
            </div>
            <div>
              <Label>Diet Type</Label>
              <Select
                value={form.dietType}
                onChange={(e) =>
                  setForm({ ...form, dietType: e.target.value })
                }
              >
                <option value="">Select…</option>
                <option value="balanced">Balanced</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="jain">Jain</option>
                <option value="keto">Keto</option>
                <option value="low-carb">Low-Carb</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="high-protein">High-Protein</option>
              </Select>
            </div>
            <div>
              <Label>Preferred Cuisine</Label>
              <Select
                value={form.preferredCuisine}
                onChange={(e) =>
                  setForm({ ...form, preferredCuisine: e.target.value })
                }
              >
                <option value="">Select…</option>
                <option value="indian">Indian</option>
                <option value="international">International</option>
                <option value="asian">Asian</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="american">American</option>
                <option value="mexican">Mexican</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Allergies & Intolerances</Label>
            <Input
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              placeholder="e.g. peanuts, lactose, gluten (comma-separated)"
            />
            <p className="text-xs text-secondary mt-1">
              AI meal plans will strictly avoid these ingredients.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Profile"}
            </Button>
            {message && (
              <span className="text-sm text-[var(--accent)] font-medium">
                {message}
              </span>
            )}
          </div>
        </GlassCard>
      </form>
    </div>
  );
}
