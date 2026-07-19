import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppProviders } from "@/components/app-providers";
import Link from "next/link";
import { Soup, Sparkles, Camera, Brain } from "lucide-react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <AppProviders>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left — branding */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-blue-500/5" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white">
                <Soup className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">NutriAI</h1>
                <p className="text-secondary">AI Health & Nutrition Companion</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-primary mb-4 leading-tight">
              Your intelligent
              <br />
              wellness partner
            </h2>
            <p className="text-secondary text-lg mb-8 max-w-md">
              Track calories, recognize food with AI, get personalized meal plans,
              and build healthier habits — all in one place.
            </p>

            <div className="grid gap-3 max-w-md">
              {[
                { icon: Camera, text: "Snap a photo, get instant nutrition estimates" },
                { icon: Brain, text: "AI coach creates personalized meal & fitness plans" },
                { icon: Sparkles, text: "Track progress with beautiful insights" },
              ].map((f, i) => (
                <div key={i} className="glass p-3 flex items-center gap-3 rounded-xl">
                  <f.icon className="w-5 h-5 text-[var(--accent)] shrink-0" />
                  <span className="text-sm text-primary">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — auth form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="md:hidden flex items-center gap-2 justify-center mb-8"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white">
                <Soup className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-primary">NutriAI</span>
            </Link>
            {children}
          </div>
        </div>
      </div>
    </AppProviders>
  );
}
