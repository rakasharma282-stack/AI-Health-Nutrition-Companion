"use client";

import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Send,
  Loader2,
  Trash2,
  Plus,
  Sparkles,
  Bot,
  User as UserIcon,
} from "lucide-react";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
}

interface Thread {
  id: number;
  title: string;
  updatedAt: string;
  _count?: { messages: number };
}

const SUGGESTIONS = [
  "How many calories are in a bowl of dal rice?",
  "Suggest a healthy vegetarian breakfast",
  "Plan meals for weight loss",
  "Recommend exercises for beginners",
  "How can I improve my sleep routine?",
  "What are good high-protein snacks?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<number | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  function loadThreads() {
    setLoadingThreads(true);
    fetch("/api/chat/threads")
      .then((r) => r.json())
      .then((d) => setThreads(d.threads || []))
      .finally(() => setLoadingThreads(false));
  }

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function startNewChat() {
    setMessages([]);
    setThreadId(null);
    setInput("");
  }

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, threadId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: d.reply },
      ]);
      if (d.threadId && d.threadId !== threadId) {
        setThreadId(d.threadId);
        loadThreads();
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Sorry, I couldn't process that. ${e instanceof Error ? e.message : ""}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteThread(id: number) {
    await fetch(`/api/chat/threads?id=${id}`, { method: "DELETE" });
    if (threadId === id) startNewChat();
    loadThreads();
  }

  return (
    <div className="animate-fade-in-up max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-4">
      {/* Threads sidebar */}
      <div className="hidden md:flex flex-col w-64 shrink-0">
        <Button onClick={startNewChat} className="mb-3">
          <Plus className="w-4 h-4" /> New Chat
        </Button>
        <div className="glass rounded-2xl p-2 flex-1 overflow-y-auto space-y-1">
          {loadingThreads ? (
            <p className="text-xs text-secondary p-3">Loading…</p>
          ) : threads.length === 0 ? (
            <p className="text-xs text-secondary p-3">No conversations yet</p>
          ) : (
            threads.map((t) => (
              <div
                key={t.id}
                className={`group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-colors ${
                  threadId === t.id
                    ? "bg-[var(--accent-light)]"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                onClick={() => {
                  setThreadId(t.id);
                  setMessages([]);
                }}
              >
                <MessageCircle className="w-4 h-4 text-secondary shrink-0" />
                <span className="text-sm text-primary truncate flex-1">
                  {t.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(t.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 p-4 border-b border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-primary">AI Wellness Assistant</h2>
              <p className="text-xs text-secondary">
                Nutrition, fitness & wellness coaching
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-[var(--accent)]" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-1">
                  Ask me anything about nutrition & wellness
                </h3>
                <p className="text-sm text-secondary mb-6 max-w-md">
                  I can help with calories, meal ideas, exercise tips, and
                  healthy lifestyle guidance.
                </p>
                <div className="grid gap-2 max-w-lg w-full">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === "user"
                        ? "bg-[var(--accent)]"
                        : "bg-[var(--accent-light)]"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <UserIcon className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-[var(--accent)]" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-[var(--accent)] text-white rounded-tr-sm"
                        : "bg-black/5 dark:bg-white/5 text-primary rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                  <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[var(--border-subtle)]">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about nutrition, fitness, wellness..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={loading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="px-4"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
