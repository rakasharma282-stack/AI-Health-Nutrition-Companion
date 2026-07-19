"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Droplets,
  Moon,
  Smile,
  Plus,
  Loader2,
  Sparkles,
  Brain,
  AlertCircle,
} from "lucide-react";

interface ProgressData {
  weight: Array<{ id: number; weightKg: number; date: string }>;
  hydration: Array<{ id: number; amountMl: number; date: string }>;
  sleep: Array<{ id: number; hours: number; quality: number; date: string }>;
  mood: Array<{ id: number; mood: number; note: string | null; date: string }>;
  exercise: Array<{ id: number; type: string; durationMin: number; caloriesBurned: number; date: string }>;
  profile: { dailyCalorieTarget: number | null; targetWeightKg: number | null; weightKg: number | null } | null;
  todayHydration: number;
}

type LogType = "weight" | "hydration" | "sleep" | "mood";

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState<LogType | null>(null);
  const [logValue, setLogValue] = useState("");
  const [logQuality, setLogQuality] = useState("3");
  const [logNote, setLogNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [insightLoading, setInsightLoading] = useState(false);
  const [insights, setInsights] = useState<{
    summary: string;
    trends: string[];
    recommendations: string[];
    positiveChanges: string[];
    areasForImprovement: string[];
    disclaimer: string;
  } | null>(null);
  const [insightError, setInsightError] = useState("");

  function load() {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function handleLog(e: React.FormEvent) {
    e.preventDefault();
    if (!showLog || !logValue) return;
    setSaving(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: showLog,
          value: logValue,
          quality: logQuality,
          note: logNote,
        }),
      });
      setShowLog(null);
      setLogValue("");
      setLogNote("");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function generateInsights() {
    setInsightLoading(true);
    setInsightError("");
    setInsights(null);
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setInsights(d);
    } catch (e) {
      setInsightError(e instanceof Error ? e.message : "Failed");
    } finally {
      setInsightLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  const weightData = data.weight.map((w) => ({
    date: new Date(w.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    weight: w.weightKg,
  }));
  const hydrationData = data.hydration.map((h) => ({
    date: new Date(h.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    ml: h.amountMl,
  }));
  const sleepData = data.sleep.map((s) => ({
    date: new Date(s.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    hours: s.hours,
  }));
  const moodData = data.mood.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    mood: m.mood,
  }));

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Progress & Insights
          </h1>
          <p className="text-secondary">
            Track trends and get AI-powered wellness analysis
          </p>
        </div>
      </div>

      {/* Quick log buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLogCard
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          title="Weight"
          value={data.profile?.weightKg ? `${data.profile.weightKg} kg` : "—"}
          onClick={() => setShowLog("weight")}
        />
        <QuickLogCard
          icon={<Droplets className="w-5 h-5 text-blue-500" />}
          title="Hydration"
          value={`${Math.round(data.todayHydration)} ml today`}
          onClick={() => setShowLog("hydration")}
        />
        <QuickLogCard
          icon={<Moon className="w-5 h-5 text-indigo-500" />}
          title="Sleep"
          value={data.sleep.length ? `${data.sleep[data.sleep.length - 1].hours}h last` : "—"}
          onClick={() => setShowLog("sleep")}
        />
        <QuickLogCard
          icon={<Smile className="w-5 h-5 text-amber-500" />}
          title="Mood"
          value={data.mood.length ? `${data.mood[data.mood.length - 1].mood}/5` : "—"}
          onClick={() => setShowLog("mood")}
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {weightData.length > 0 && (
          <GlassCard>
            <h3 className="font-semibold text-primary mb-4">Weight Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        )}

        {hydrationData.length > 0 && (
          <GlassCard>
            <h3 className="font-semibold text-primary mb-4">Hydration</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hydrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 8 }} />
                <Bar dataKey="ml" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        )}

        {sleepData.length > 0 && (
          <GlassCard>
            <h3 className="font-semibold text-primary mb-4">Sleep Hours</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        )}

        {moodData.length > 0 && (
          <GlassCard>
            <h3 className="font-semibold text-primary mb-4">Mood</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis domain={[0, 5]} stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="mood" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        )}
      </div>

      {weightData.length === 0 && hydrationData.length === 0 && sleepData.length === 0 && moodData.length === 0 && (
        <GlassCard className="text-center py-12">
          <TrendingUp className="w-10 h-10 mx-auto text-secondary opacity-40 mb-2" />
          <p className="text-secondary">Start logging to see your progress charts</p>
        </GlassCard>
      )}

      {/* AI Insights */}
      <GlassCard strong>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Brain className="w-5 h-5 text-[var(--accent)]" /> AI Health Insights
          </h3>
          <Button onClick={generateInsights} disabled={insightLoading} variant="outline">
            {insightLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Analyze Trends
          </Button>
        </div>

        {insightError && (
          <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{insightError}</span>
          </div>
        )}

        {insights ? (
          <div className="space-y-4">
            <p className="text-primary">{insights.summary}</p>

            {insights.positiveChanges.length > 0 && (
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">✅ Positive Changes</p>
                <ul className="text-sm text-secondary space-y-1 list-disc pl-5">
                  {insights.positiveChanges.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            {insights.areasForImprovement.length > 0 && (
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">⚠️ Areas to Improve</p>
                <ul className="text-sm text-secondary space-y-1 list-disc pl-5">
                  {insights.areasForImprovement.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            {insights.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[var(--accent)] mb-1">💡 Recommendations</p>
                <ul className="text-sm text-secondary space-y-1 list-disc pl-5">
                  {insights.recommendations.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            <p className="text-xs text-secondary italic">{insights.disclaimer}</p>
          </div>
        ) : !insightLoading && (
          <p className="text-secondary text-sm">
            Log your health data for a few days, then click &quot;Analyze Trends&quot; for AI-powered insights.
          </p>
        )}
      </GlassCard>

      {/* Log modal */}
      <Modal open={!!showLog} onClose={() => setShowLog(null)} title={`Log ${showLog || ""}`}>
        <form onSubmit={handleLog} className="space-y-4">
          {showLog === "weight" && (
            <div>
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" placeholder="70.5" value={logValue} onChange={(e) => setLogValue(e.target.value)} required />
            </div>
          )}
          {showLog === "hydration" && (
            <div>
              <Label>Water (ml)</Label>
              <Input type="number" placeholder="250" value={logValue} onChange={(e) => setLogValue(e.target.value)} required />
              <div className="flex gap-2 mt-2">
                {[200, 250, 500].map((v) => (
                  <button key={v} type="button" onClick={() => setLogValue(v.toString())} className="px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-xs text-secondary hover:bg-black/10">
                    +{v}ml
                  </button>
                ))}
              </div>
            </div>
          )}
          {showLog === "sleep" && (
            <>
              <div>
                <Label>Hours Slept</Label>
                <Input type="number" step="0.5" placeholder="7.5" value={logValue} onChange={(e) => setLogValue(e.target.value)} required />
              </div>
              <div>
                <Label>Sleep Quality</Label>
                <Select value={logQuality} onChange={(e) => setLogQuality(e.target.value)}>
                  <option value="1">1 - Very Poor</option>
                  <option value="2">2 - Poor</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Good</option>
                  <option value="5">5 - Excellent</option>
                </Select>
              </div>
            </>
          )}
          {showLog === "mood" && (
            <>
              <div>
                <Label>Mood (1-5)</Label>
                <Select value={logValue || "3"} onChange={(e) => setLogValue(e.target.value)}>
                  <option value="1">1 - 😞 Very Low</option>
                  <option value="2">2 - 😟 Low</option>
                  <option value="3">3 - 😐 Neutral</option>
                  <option value="4">4 - 🙂 Good</option>
                  <option value="5">5 - 😄 Great</option>
                </Select>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input placeholder="How are you feeling?" value={logNote} onChange={(e) => setLogNote(e.target.value)} />
              </div>
            </>
          )}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function QuickLogCard({
  icon,
  title,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="glass p-4 rounded-xl text-left hover:scale-[1.02] transition-transform">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-secondary">{title}</span>
      </div>
      <p className="font-semibold text-primary text-sm">{value}</p>
      <p className="text-xs text-[var(--accent)] mt-1">Tap to log →</p>
    </button>
  );
}
