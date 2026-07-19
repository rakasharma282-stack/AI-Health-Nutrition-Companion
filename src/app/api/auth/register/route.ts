import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  calculateBMR,
  calculateCalorieTarget,
  calculateMacros,
  calculateTDEE,
} from "@/lib/nutrition";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        passwordHash,
        role: "USER",
        provider: "credentials",
      },
    });

    // Create empty health profile
    await prisma.healthProfile.create({
      data: { userId: user.id },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Recompute derived nutrition targets from profile basics, persist, and return updated profile */
export async function recomputeProfileTargets(userId: number) {
  const profile = await prisma.healthProfile.findUnique({
    where: { userId },
  });
  if (!profile) return null;

  let bmr: number | null = null;
  let calorieTarget: number | null = null;
  const macros = { proteinTarget: null, carbTarget: null, fatTarget: null } as {
    proteinTarget: number | null;
    carbTarget: number | null;
    fatTarget: number | null;
  };

  if (
    profile.heightCm &&
    profile.weightKg &&
    profile.dateOfBirth &&
    profile.gender &&
    profile.activityLevel
  ) {
    const age = Math.floor(
      (Date.now() - profile.dateOfBirth.getTime()) /
        (365.25 * 24 * 60 * 60 * 1000),
    );
    bmr = calculateBMR(profile.weightKg, profile.heightCm, age, profile.gender as "male" | "female" | "other");
    const tdee = calculateTDEE(
      bmr,
      profile.activityLevel as "sedentary" | "light" | "moderate" | "active" | "very_active",
    );
    calorieTarget = calculateCalorieTarget(
      tdee,
      (profile.goal as "lose" | "maintain" | "gain") || "maintain",
    );
    const m = calculateMacros(
      calorieTarget,
      profile.dietType || "balanced",
      (profile.goal as "lose" | "maintain" | "gain") || "maintain",
    );
    macros.proteinTarget = m.proteinTarget;
    macros.carbTarget = m.carbTarget;
    macros.fatTarget = m.fatTarget;
  }

  return prisma.healthProfile.update({
    where: { userId },
    data: { bmr, dailyCalorieTarget: calorieTarget, ...macros },
  });
}
