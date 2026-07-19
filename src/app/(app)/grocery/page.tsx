"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Plus,
  Check,
  Loader2,
  Trash2,
  Sparkles,
} from "lucide-react";

interface GroceryItem {
  name: string;
  qty: string;
  category: string;
  checked: boolean;
}

export default function GroceryPage() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [week, setWeek] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/grocery")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setWeek(d.week || "");
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function persist(updated: GroceryItem[]) {
    setItems(updated);
    await fetch("/api/grocery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: updated,
      }),
    });
  }

  function toggleCheck(idx: number) {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, checked: !item.checked } : item,
    );
    persist(updated);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", name: newItem.trim() }),
      });
      setNewItem("");
      load();
    } finally {
      setSaving(false);
    }
  }

  function removeItem(idx: number) {
    const updated = items.filter((_, i) => i !== idx);
    persist(updated);
  }

  // Group by category
  const categories = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const checkedCount = items.filter((i) => i.checked).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Grocery Planner
          </h1>
          <p className="text-secondary">
            Week {week} · {checkedCount}/{items.length} items collected
          </p>
        </div>
      </div>

      {/* Add item */}
      <form onSubmit={addItem}>
        <GlassCard className="flex gap-2">
          <Input
            placeholder="Add an item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </Button>
        </GlassCard>
      </form>

      {items.length === 0 ? (
        <GlassCard className="text-center py-12">
          <ShoppingCart className="w-10 h-10 mx-auto text-secondary opacity-40 mb-2" />
          <p className="text-secondary mb-2">Your grocery list is empty</p>
          <p className="text-xs text-secondary flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Generate a meal plan in the Coach to auto-fill ingredients
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {Object.entries(categories).map(([category, catItems]) => {
            const startIndex = items.findIndex((i) => i.category === category);
            return (
              <GlassCard key={category}>
                <h3 className="font-semibold text-primary mb-3">{category}</h3>
                <div className="space-y-1">
                  {catItems.map((item, j) => {
                    const idx = startIndex + j;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 group"
                      >
                        <button
                          onClick={() => toggleCheck(idx)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            item.checked
                              ? "bg-[var(--accent)] border-[var(--accent)]"
                              : "border-[var(--glass-border)]"
                          }`}
                        >
                          {item.checked && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span
                          className={`flex-1 text-sm ${
                            item.checked
                              ? "line-through text-secondary"
                              : "text-primary"
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.qty && (
                          <span className="text-xs text-secondary">{item.qty}</span>
                        )}
                        <button
                          onClick={() => removeItem(idx)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
