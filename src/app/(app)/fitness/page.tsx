"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Dumbbell,
  Plus,
  Trash2,
  Flame,
  Clock,
  Loader2,
  Sparkles,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface ExerciseLog {
  id: number;
  type: string;
  durationMin: number;
  caloriesBurned: number;
  intensity: string;
  date: string;
}

interface PlanResult {
  title: string;
  level: string;
  workouts: Array<{
    day: string;
    focus: string;
    exercises: Array<{ name: string; duration: string; description: string }>;
    estimatedCaloriesBurned: number;
  }>;
  tips: string;
}

const EXERCISE_TYPES = [
  "Walking", "Running", "Cycling", "Yoga", "Strength Training",
  "Home Workout", "Stretching", "HIIT", "Meditation", "Swimming",
  "Dancing", "Hiking", "Weight Lifting",
];

export default function FitnessPage() {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [weekTotal, setWeekTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: "Walking", durationMin: 30, intensity: "moderate" });
  const [saving, setSaving] = useState(false);

  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [planError, setPlanError] = useState("");
  const [planForm, setPlanForm] = useState({
    fitnessLevel: "beginner",
    goal: "general fitness",
    daysPerWeek: 4,
    workoutDuration: 30,
  });

  function load() {
    fetch("/api/fitness")
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs || []);
        setWeekTotal(d.weekTotal || 0);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/fitness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setShowAdd(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/fitness?id=${id}`, { method: "DELETE" });
    setLogs(logs.filter((l) => l.id !== id));
  }

  async function generatePlan(e: React.FormEvent) {
    e.preventDefault();
    setPlanLoading(true);
    setPlanError("");
    setPlan(null);
    try {
      const res = await fetch("/api/ai/exercise-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setPlan(d);
    } catch (e) {
      setPlanError(e instanceof Error ? e.message : "Failed");
    } finally {
      setPlanLoading(false);
    }
  }

  const todayCalories = logs
    .filter((l) => new Date(l.date).toDateString() === new Date().toDateString())
    .reduce((s, l) => s + l.caloriesBurned, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Fitness Planner
          </h1>
          <p className="text-secondary">
            Log workouts and generate AI exercise plans
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <GlassCard className="text-center py-4">
          <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
          <p className="text-xl font-bold text-primary">{todayCalories}</p>
          <p className="text-xs text-secondary">Calories Burned Today</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-xl font-bold text-[var(--accent)]">{weekTotal}</p>
          <p className="text-xs text-secondary">Calories This Week</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-xl font-bold text-primary">{logs.length}</p>
          <p className="text-xs text-secondary">Total Workouts</p>
        </GlassCard>
      </div>

      {/* Log workout */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" /> Log Workout
        </Button>
      </div>

      {/* Workout log */}
      <GlassCard>
        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--accent)]" /> Recent Workouts
        </h3>
        {logs.length === 0 ? (
          <p className="text-center text-secondary text-sm py-6">
            No workouts logged yet. Start by clicking &quot;Log Workout&quot;.
          </p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="font-medium text-primary text-sm">{log.type}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {log.durationMin} min
                      </span>
                      <Badge>{log.intensity}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary text-sm">
                    {log.caloriesBurned} cal
                  </span>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* AI Plan Generator */}
      <form onSubmit={generatePlan}>
        <GlassCard className="space-y-4">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" /> AI Exercise Plan Generator
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label>Fitness Level</Label>
              <Select
                value={planForm.fitnessLevel}
                onChange={(e) => setPlanForm({ ...planForm, fitnessLevel: e.target.value })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
            <div>
              <Label>Goal</Label>
              <Select
                value={planForm.goal}
                onChange={(e) => setPlanForm({ ...planForm, goal: e.target.value })}
              >
                <option value="general fitness">General Fitness</option>
                <option value="weight loss">Weight Loss</option>
                <option value="muscle gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
                <option value="flexibility">Flexibility</option>
              </Select>
            </div>
            <div>
              <Label>Days/Week</Label>
              <Input
                type="number"
                min="1"
                max="7"
                value={planForm.daysPerWeek}
                onChange={(e) => setPlanForm({ ...planForm, daysPerWeek: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input
                type="number"
                min="10"
                max="120"
                value={planForm.workoutDuration}
                onChange={(e) => setPlanForm({ ...planForm, workoutDuration: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button type="submit" disabled={planLoading}>
            {planLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Exercise Plan
              </>
            )}
          </Button>
          {planError && (
            <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{planError}</span>
            </div>
          )}
        </GlassCard>
      </form>

      {/* Plan result */}
      {plan && (
        <div className="space-y-4 animate-fade-in-up">
          <GlassCard strong>
            <h2 className="text-2xl font-bold text-primary">{plan.title}</h2>
            <Badge variant="accent" className="mt-1">{plan.level}</Badge>
          </GlassCard>

          <div className="space-y-3">
            {plan.workouts.map((day, i) => (
              <GlassCard key={i}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-primary">{day.day}</h3>
                    <p className="text-sm text-secondary">{day.focus}</p>
                  </div>
                  <Badge variant="accent">
                    ~{day.estimatedCaloriesBurned} cal
                  </Badge>
                </div>
                <div className="space-y-2">
                  {day.exercises.map((ex, j) => (
                    <div
                      key={j}
                      className="p-3 rounded-xl bg-black/5 dark:bg-white/5"
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-primary text-sm">
                          {ex.name}
                        </p>
                        <span className="text-xs text-secondary">{ex.duration}</span>
                      </div>
                      <p className="text-xs text-secondary mt-1">{ex.description}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>

          {plan.tips && (
            <GlassCard className="border-l-4 border-amber-400">
              <p className="text-sm text-secondary whitespace-pre-wrap">{plan.tips}</p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Log Workout">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label>Exercise Type</Label>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {EXERCISE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              min="1"
              value={form.durationMin}
              onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Intensity</Label>
            <Select
              value={form.intensity}
              onChange={(e) => setForm({ ...form, intensity: e.target.value })}
            >
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="vigorous">Vigorous</option>
            </Select>
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Log Workout
          </Button>
        </form>
      </Modal>
    </div>
  );
}
