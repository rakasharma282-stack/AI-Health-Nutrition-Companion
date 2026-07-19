import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMealPlan, type MealPlanResult } from "@/lib/ai";
import { calculateAge } from "@/lib/nutrition";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const planType = body.planType === "weekly" ? "weekly" : "daily";

    const userId = Number(session.user.id);
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile?.dailyCalorieTarget) {
      return NextResponse.json(
        { error: "Please complete your health profile first to get a personalized plan." },
        { status: 400 },
      );
    }

    const age = profile.dateOfBirth
      ? calculateAge(profile.dateOfBirth)
      : 30;

    const userProfileText = `Create a ${planType} meal plan for:
- Daily calorie target: ${Math.round(profile.dailyCalorieTarget)} cal
- Diet type: ${profile.dietType || "balanced"}
- Goal: ${profile.goal || "maintain"} weight
- Preferred cuisine: ${profile.preferredCuisine || "any"}
- Age: ${age}, Gender: ${profile.gender || "unspecified"}
- Current weight: ${profile.weightKg || "unknown"} kg, Target: ${profile.targetWeightKg || "unknown"} kg
- Allergies: ${profile.allergies || "none"}
- Protein target: ${profile.proteinTarget || "default"}g, Carbs: ${profile.carbTarget || "default"}g, Fat: ${profile.fatTarget || "default"}g`;

    const result = await generateMealPlan(userProfileText);

    // Persist
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (planType === "weekly" ? 7 : 1));

    const plan = await prisma.mealPlan.create({
      data: {
        userId,
        planType,
        startDate: now,
        endDate,
        content: result as never,
      },
    });

    return NextResponse.json({ ...result, planId: plan.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate meal plan";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.mealPlan.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ plans });
}
