"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Soup,
  Sparkles,
  Loader2,
  Clock,
  Users,
  ChefHat,
  AlertCircle,
  ListOrdered,
} from "lucide-react";

interface Recipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: Array<{ name: string; amount: string }>;
  steps: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  tips: string;
  recipeId?: number;
}

interface SavedRecipe {
  id: number;
  title: string;
  createdAt: string;
}

export default function RecipesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState<SavedRecipe[]>([]);
  const [viewing, setViewing] = useState<Recipe | null>(null);
  const [form, setForm] = useState({
    ingredients: "",
    dietType: "",
    maxTime: "",
    goal: "",
    cuisine: "",
  });

  useEffect(() => {
    fetch("/api/ai/recipe").then((r) => r.json()).then((d) => setSaved(d.recipes || []));
  }, []);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setResult(d);
      // Refresh saved list
      const savedRes = await fetch("/api/ai/recipe").then((r) => r.json());
      setSaved(savedRes.recipes || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate recipe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
          <Soup className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            AI Recipe Generator
          </h1>
          <p className="text-secondary">
            Get healthy recipes based on your ingredients & preferences
          </p>
        </div>
      </div>

      <form onSubmit={generate}>
        <GlassCard className="space-y-4">
          <div>
            <Label>Available Ingredients</Label>
            <Input
              placeholder="e.g. chicken, rice, tomatoes, spinach"
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label>Diet</Label>
              <Select
                value={form.dietType}
                onChange={(e) => setForm({ ...form, dietType: e.target.value })}
              >
                <option value="">Any</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="high-protein">High Protein</option>
                <option value="low-carb">Low Carb</option>
              </Select>
            </div>
            <div>
              <Label>Max Time (min)</Label>
              <Input
                type="number"
                placeholder="30"
                value={form.maxTime}
                onChange={(e) => setForm({ ...form, maxTime: e.target.value })}
              />
            </div>
            <div>
              <Label>Goal</Label>
              <Select
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              >
                <option value="">Any</option>
                <option value="weight loss">Weight Loss</option>
                <option value="muscle gain">Muscle Gain</option>
                <option value="high energy">High Energy</option>
                <option value="low calorie">Low Calorie</option>
              </Select>
            </div>
            <div>
              <Label>Cuisine</Label>
              <Select
                value={form.cuisine}
                onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
              >
                <option value="">Any</option>
                <option value="indian">Indian</option>
                <option value="asian">Asian</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="american">American</option>
                <option value="mexican">Mexican</option>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cooking up a recipe...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Recipe
              </>
            )}
          </Button>
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </GlassCard>
      </form>

      {/* Result */}
      {result && (
        <RecipeCard recipe={result} />
      )}

      {/* Saved recipes */}
      {saved.length > 0 && (
        <div>
          <h2 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-[var(--accent)]" />
            Recently Generated
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {saved.map((r) => (
              <GlassCard
                key={r.id}
                className="hover:scale-[1.01] transition-transform cursor-pointer"
              >
                <button
                  className="text-left w-full"
                  onClick={async () => {
                    const detail = await fetch(`/api/ai/recipe/${r.id}`).then((res) => res.json());
                    if (detail.recipe) setViewing(detail.recipe);
                  }}
                >
                  <p className="font-medium text-primary">{r.title}</p>
                  <p className="text-xs text-secondary">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <GlassCard strong className="space-y-4 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-1">{recipe.title}</h2>
        <p className="text-secondary">{recipe.description}</p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="flex items-center gap-1 text-secondary">
          <Clock className="w-4 h-4" /> Prep: {recipe.prepTime}
        </span>
        <span className="flex items-center gap-1 text-secondary">
          <Clock className="w-4 h-4" /> Cook: {recipe.cookTime}
        </span>
        <span className="flex items-center gap-1 text-secondary">
          <Users className="w-4 h-4" /> {recipe.servings} servings
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <NutritionBox label="Cal" value={`${recipe.nutrition.calories}`} color="text-orange-500" />
        <NutritionBox label="Protein" value={`${recipe.nutrition.protein}g`} color="text-blue-500" />
        <NutritionBox label="Carbs" value={`${recipe.nutrition.carbs}g`} color="text-amber-500" />
        <NutritionBox label="Fat" value={`${recipe.nutrition.fat}g`} color="text-purple-500" />
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-2">Ingredients</h3>
        <div className="space-y-1">
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 px-3 rounded-lg bg-black/5 dark:bg-white/5">
              <span className="text-primary">{ing.name}</span>
              <span className="text-secondary">{ing.amount}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-[var(--accent)]" /> Instructions
        </h3>
        <ol className="space-y-2">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-primary pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {recipe.tips && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-sm">
          <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">💡 Tip</p>
          <p className="text-secondary">{recipe.tips}</p>
        </div>
      )}
    </GlassCard>
  );
}

function NutritionBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-center">
      <p className={`font-bold ${color}`}>{value}</p>
      <p className="text-xs text-secondary">{label}</p>
    </div>
  );
}
