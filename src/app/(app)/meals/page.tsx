"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Search,
  Plus,
  Trash2,
  Utensils,
  Coffee,
  Sun,
  Moon as MoonIcon,
  Cookie,
  Loader2,
  Camera,
  Sparkles,
  Flame,
  X,
} from "lucide-react";

interface FoodItem {
  id: number;
  name: string;
  brand?: string | null;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  fiberPerServing?: number | null;
  servingSize: number;
  servingUnit: string;
  dietTags?: string | null;
  cuisine?: string | null;
}

interface MealLog {
  id: number;
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
  quantity: number;
  photoUrl?: string | null;
}

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", icon: Coffee },
  { value: "lunch", label: "Lunch", icon: Sun },
  { value: "dinner", label: "Dinner", icon: MoonIcon },
  { value: "snack", label: "Snack", icon: Cookie },
];

export default function MealsPage() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<"search" | "photo">(
    params.get("tab") === "photo" ? "photo" : "search",
  );

  const loadMeals = useCallback(async () => {
    const res = await fetch("/api/meals");
    const d = await res.json();
    setMeals(d.meals || []);
  }, []);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // Determine current meal type by time
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 11) setMealType("breakfast");
    else if (h < 15) setMealType("lunch");
    else if (h < 18) setMealType("snack");
    else setMealType("dinner");
  }, []);

  // Debounced search
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/food?q=${encodeURIComponent(search)}`);
      const d = await res.json();
      setResults(d.items || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleLogFood() {
    if (!selectedFood) return;
    setLoading(true);
    try {
      const f = selectedFood;
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodItemId: f.id,
          source: "search",
          mealType,
          quantity,
          name: f.name,
          calories: f.caloriesPerServing * quantity,
          protein: f.proteinPerServing * quantity,
          carbs: f.carbsPerServing * quantity,
          fat: f.fatPerServing * quantity,
          fiber: f.fiberPerServing ? f.fiberPerServing * quantity : undefined,
        }),
      });
      setSelectedFood(null);
      setQuantity(1);
      await loadMeals();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/meals?id=${id}`, { method: "DELETE" });
    setMeals(meals.filter((m) => m.id !== id));
  }

  async function handlePhotoLoged() {
    await loadMeals();
    setTab("search");
  }

  const grouped = MEAL_TYPES.map((mt) => ({
    ...mt,
    items: meals.filter((m) => m.mealType === mt.value),
  }));

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Meals & Calories
        </h1>
        <p className="text-secondary">
          Search foods, log meals, or snap a photo for AI analysis
        </p>
      </div>

      {/* Daily totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="text-center py-4">
          <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
          <p className="text-xl font-bold text-primary">
            {Math.round(totalCalories)}
          </p>
          <p className="text-xs text-secondary">Calories</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-xl font-bold text-blue-500">
            {Math.round(totalProtein)}g
          </p>
          <p className="text-xs text-secondary">Protein</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-xl font-bold text-amber-500">
            {Math.round(totalCarbs)}g
          </p>
          <p className="text-xs text-secondary">Carbs</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-xl font-bold text-purple-500">
            {Math.round(totalFat)}g
          </p>
          <p className="text-xs text-secondary">Fat</p>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("search")}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            tab === "search"
              ? "btn-accent"
              : "glass text-secondary hover:text-primary"
          }`}
        >
          <Search className="w-4 h-4" /> Search Food
        </button>
        <button
          onClick={() => setTab("photo")}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            tab === "photo"
              ? "btn-accent"
              : "glass text-secondary hover:text-primary"
          }`}
        >
          <Camera className="w-4 h-4" /> Photo Scan (AI)
        </button>
      </div>

      {tab === "search" ? (
        <GlassCard>
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input
              placeholder="Search for food (e.g. roti, banana, chicken breast)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            {searching && (
              <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-secondary" />
            )}
          </div>

          {search.trim() && results.length === 0 && !searching && (
            <p className="text-center text-secondary text-sm py-4">
              No foods found. Try a different search term.
            </p>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((food) => (
              <button
                key={food.id}
                onClick={() => setSelectedFood(food)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-primary text-sm">{food.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-secondary">
                      {food.caloriesPerServing} cal / {food.servingSize}
                      {food.servingUnit}
                    </span>
                    {food.cuisine && (
                      <Badge>{food.cuisine}</Badge>
                    )}
                    {food.dietTags?.split(",").map((tag) => (
                      <Badge key={tag} variant="accent">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Plus className="w-5 h-5 text-[var(--accent)] shrink-0" />
              </button>
            ))}
          </div>
        </GlassCard>
      ) : (
        <PhotoScanner onLogged={handlePhotoLoged} mealType={mealType} setMealType={setMealType} />
      )}

      {/* Meal sections */}
      <div className="space-y-3">
        {grouped.map((group) => (
          <GlassCard key={group.value}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <group.icon className="w-4 h-4 text-[var(--accent)]" />
                {group.label}
              </h3>
              <Badge>
                {Math.round(group.items.reduce((s, m) => s + m.calories, 0))} cal
              </Badge>
            </div>
            {group.items.length > 0 ? (
              <div className="space-y-2">
                {group.items.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 group"
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
                          <Utensils className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-primary text-sm">
                          {meal.name}
                          {meal.quantity > 1 && ` ×${meal.quantity}`}
                        </p>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-secondary">
                            P{Math.round(meal.protein)} · C{Math.round(meal.carbs)} · F{Math.round(meal.fat)}
                          </span>
                          {meal.source === "photo" && (
                            <Badge variant="accent">
                              <Sparkles className="w-3 h-3 mr-0.5" />AI
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary text-sm">
                        {Math.round(meal.calories)} cal
                      </span>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary py-2">No items logged</p>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Log food modal */}
      <Modal
        open={!!selectedFood}
        onClose={() => setSelectedFood(null)}
        title={selectedFood?.name || ""}
      >
        {selectedFood && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <NutritionStat label="Cal" value={selectedFood.caloriesPerServing} color="text-orange-500" />
              <NutritionStat label="Protein" value={`${selectedFood.proteinPerServing}g`} color="text-blue-500" />
              <NutritionStat label="Carbs" value={`${selectedFood.carbsPerServing}g`} color="text-amber-500" />
              <NutritionStat label="Fat" value={`${selectedFood.fatPerServing}g`} color="text-purple-500" />
            </div>
            <p className="text-sm text-secondary text-center">
              Per {selectedFood.servingSize} {selectedFood.servingUnit}
            </p>

            <div>
              <Label>Meal Type</Label>
              <Select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                {MEAL_TYPES.map((mt) => (
                  <option key={mt.value} value={mt.value}>
                    {mt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Servings</Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--accent-light)]">
              <span className="text-sm text-secondary">Total calories</span>
              <span className="font-bold text-[var(--accent)] text-lg">
                {Math.round(selectedFood.caloriesPerServing * quantity)} cal
              </span>
            </div>

            <Button
              onClick={handleLogFood}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Log Meal
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function NutritionStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5">
      <p className={`font-bold ${color}`}>{value}</p>
      <p className="text-xs text-secondary">{label}</p>
    </div>
  );
}

// Photo scanner component (Phase 3 implementation)
function PhotoScanner({
  onLogged,
  mealType,
  setMealType,
}: {
  onLogged: () => void;
  mealType: string;
  setMealType: (v: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    foods: Array<{
      name: string;
      estimatedPortion: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
    totalCalories: number;
    healthierAlternatives: string[];
    description: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [logging, setLogging] = useState(false);

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mealType", mealType);
      const res = await fetch("/api/ai/food-recognition", {
        method: "POST",
        body: formData,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Analysis failed");
      setResult(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze photo");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleLogResult() {
    if (!result || result.foods.length === 0) return;
    setLogging(true);
    try {
      // Upload the photo first
      let photoUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const upRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          photoUrl = upData.url;
        }
      }

      // Log each identified food
      for (const food of result.foods) {
        await fetch("/api/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "photo",
            mealType,
            photoUrl,
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            quantity: 1,
          }),
        });
      }
      // Reset
      setFile(null);
      setPreview("");
      setResult(null);
      onLogged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to log");
    } finally {
      setLogging(false);
    }
  }

  return (
    <GlassCard>
      <div className="space-y-4">
        <div>
          <Label>Meal Type</Label>
          <Select value={mealType} onChange={(e) => setMealType(e.target.value)}>
            {MEAL_TYPES.map((mt) => (
              <option key={mt.value} value={mt.value}>
                {mt.label}
              </option>
            ))}
          </Select>
        </div>

        {!preview ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--glass-border)] rounded-2xl py-12 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Camera className="w-10 h-10 text-secondary mb-2" />
            <p className="text-secondary text-sm">
              Click to upload a meal photo
            </p>
            <p className="text-xs text-secondary mt-1">
              AI will identify foods & estimate nutrition
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Meal preview"
              className="w-full max-h-64 object-cover rounded-2xl"
            />
            <button
              onClick={() => {
                setFile(null);
                setPreview("");
                setResult(null);
              }}
              className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        {file && !result && (
          <Button onClick={handleAnalyze} disabled={analyzing} className="w-full">
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Photo
              </>
            )}
          </Button>
        )}

        {result && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">AI Analysis Result</span>
            </div>

            {result.foods.length === 0 ? (
              <p className="text-secondary text-sm">{result.description}</p>
            ) : (
              <>
                <p className="text-sm text-secondary">{result.description}</p>
                <div className="space-y-2">
                  {result.foods.map((food, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-black/5 dark:bg-white/5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-primary">{food.name}</p>
                          <p className="text-xs text-secondary">
                            {food.estimatedPortion}
                          </p>
                        </div>
                        <span className="font-bold text-[var(--accent)]">
                          {Math.round(food.calories)} cal
                        </span>
                      </div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-blue-500">P {food.protein}g</span>
                        <span className="text-amber-500">C {food.carbs}g</span>
                        <span className="text-purple-500">F {food.fat}g</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[var(--accent-light)]">
                  <p className="font-bold text-primary text-lg text-center">
                    Total: {Math.round(result.totalCalories)} calories
                  </p>
                </div>

                {result.healthierAlternatives.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">
                      💡 Healthier Alternatives
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.healthierAlternatives.map((alt, i) => (
                        <Badge key={i} variant="accent">
                          {alt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleLogResult}
                  disabled={logging}
                  className="w-full"
                >
                  {logging ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Log All Items
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
