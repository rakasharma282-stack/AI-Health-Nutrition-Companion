"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <GlassCard strong className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-primary mb-1">Welcome back</h2>
      <p className="text-secondary text-sm mb-6">
        Sign in to continue your wellness journey
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : (<><LogIn className="w-4 h-4" /> Sign In</>)}
        </Button>
      </form>

      <p className="text-center text-sm text-secondary mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[var(--accent)] font-medium hover:underline"
        >
          Create one
        </Link>
      </p>

      <div className="mt-6 p-3 rounded-lg bg-black/5 dark:bg-white/5 text-xs text-secondary text-center">
        <p className="font-medium mb-1">Demo accounts</p>
        <p>User: demo@nutrition.app / Demo@1234</p>
        <p>Admin: admin@nutrition.app / Admin@1234</p>
      </div>
    </GlassCard>
  );
}
