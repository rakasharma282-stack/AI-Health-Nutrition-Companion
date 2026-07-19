"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  BookOpen,
  Clock,
  Utensils,
  Droplets,
  Moon,
  Brain,
  Dumbbell,
  Sparkles,
} from "lucide-react";

interface Article {
  id: number;
  category: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  author: string | null;
  readTime: number;
  createdAt: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  nutrition: <Utensils className="w-4 h-4" />,
  hydration: <Droplets className="w-4 h-4" />,
  sleep: <Moon className="w-4 h-4" />,
  stress: <Brain className="w-4 h-4" />,
  fitness: <Dumbbell className="w-4 h-4" />,
  ayurveda: <Sparkles className="w-4 h-4" />,
};

export default function WellnessPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [viewing, setViewing] = useState<Article | null>(null);
  const [viewingLoading, setViewingLoading] = useState(false);

  useEffect(() => {
    const url = filter ? `/api/articles?category=${filter}` : "/api/articles";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setArticles(d.articles || []);
        setLoading(false);
      });
  }, [filter]);

  async function openArticle(id: number) {
    setViewingLoading(true);
    setViewing(null);
    const res = await fetch(`/api/articles/${id}`);
    const d = await res.json();
    setViewing(d.article);
    setViewingLoading(false);
  }

  const categories = ["nutrition", "hydration", "sleep", "stress", "fitness", "ayurveda"];

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Wellness Hub</h1>
          <p className="text-secondary">
            Evidence-informed guidance for healthier living
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            filter === "" ? "btn-accent" : "glass text-secondary"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              filter === cat ? "btn-accent" : "glass text-secondary"
            }`}
          >
            {CATEGORY_ICONS[cat]}
            <span className="capitalize">{cat}</span>
          </button>
        ))}
      </div>

      {/* Articles */}
      {loading ? (
        <div className="text-center py-12 text-secondary">Loading articles…</div>
      ) : articles.length === 0 ? (
        <GlassCard className="text-center py-12">
          <BookOpen className="w-10 h-10 mx-auto text-secondary opacity-40 mb-2" />
          <p className="text-secondary">No articles in this category yet.</p>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {articles.map((article) => (
            <GlassCard key={article.id} className="overflow-hidden p-0 hover:scale-[1.01] transition-transform cursor-pointer">
              <button onClick={() => openArticle(article.id)} className="text-left w-full">
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="accent">
                      <span className="capitalize">{article.category}</span>
                    </Badge>
                    <span className="text-xs text-secondary flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime} min read
                    </span>
                  </div>
                  <h3 className="font-bold text-primary mb-1">{article.title}</h3>
                  <p className="text-sm text-secondary line-clamp-2">{article.summary}</p>
                </div>
              </button>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Article modal */}
      <Modal open={!!viewing || viewingLoading} onClose={() => setViewing(null)} title="" wide>
        {viewingLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-secondary">Loading…</div>
          </div>
        ) : viewing ? (
          <div>
            {viewing.imageUrl && (
              <img src={viewing.imageUrl} alt={viewing.title} className="w-full h-48 object-cover rounded-xl mb-4" />
            )}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="accent">
                <span className="capitalize">{viewing.category}</span>
              </Badge>
              <span className="text-xs text-secondary flex items-center gap-1">
                <Clock className="w-3 h-3" /> {viewing.readTime} min read
              </span>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-1">{viewing.title}</h2>
            {viewing.author && (
              <p className="text-xs text-secondary mb-4">By {viewing.author}</p>
            )}
            <div className="prose prose-sm max-w-none text-primary whitespace-pre-wrap leading-relaxed">
              <MarkdownContent content={viewing.content} />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

/** Lightweight inline markdown: bold, headers, lists */
function MarkdownContent({ content }: { content: string }) {
  // Split into blocks by double newlines
  const blocks = content.trim().split(/\n\n+/);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        // Ordered list
        if (lines.every((l) => /^\d+\./.test(l.trim()))) {
          return (
            <ol key={i} className="list-decimal pl-6 space-y-1 my-2">
              {lines.map((l, j) => (
                <li key={j} className="text-secondary">{renderInline(l.replace(/^\d+\.\s*/, ""))}</li>
              ))}
            </ol>
          );
        }
        // Unordered list
        if (lines.every((l) => /^[-*]\s/.test(l.trim()))) {
          return (
            <ul key={i} className="list-disc pl-6 space-y-1 my-2">
              {lines.map((l, j) => (
                <li key={j} className="text-secondary">{renderInline(l.replace(/^[-*]\s*/, ""))}</li>
              ))}
            </ul>
          );
        }
        // Header
        if (block.startsWith("# ")) {
          return <h3 key={i} className="font-bold text-primary text-lg mt-4 mb-2">{renderInline(block.slice(2))}</h3>;
        }
        // Paragraph
        return (
          <p key={i} className="text-secondary my-2 leading-relaxed">
            {renderInline(block)}
          </p>
        );
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-primary">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
