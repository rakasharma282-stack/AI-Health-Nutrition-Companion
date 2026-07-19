import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(session.user.id);

  const [profile, meals, hydration, sleep, exercise] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId } }),
    prisma.mealLog.findMany({
      where: {
        userId,
        date: { gte: startOfDay(), lte: endOfDay() },
      },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.hydrationLog.aggregate({
      where: {
        userId,
        date: { gte: startOfDay(), lte: endOfDay() },
      },
      _sum: { amountMl: true },
    }),
    prisma.sleepLog.findFirst({
      where: {
        userId,
        date: { gte: startOfDay(), lte: endOfDay() },
      },
    }),
    prisma.exerciseLog.aggregate({
      where: {
        userId,
        date: { gte: startOfDay(), lte: endOfDay() },
      },
      _sum: { caloriesBurned: true },
    }),
  ]);

  const totals = meals.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fat += m.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return NextResponse.json({
    profile: profile
      ? {
          dailyCalorieTarget: profile.dailyCalorieTarget,
          proteinTarget: profile.proteinTarget,
          carbTarget: profile.carbTarget,
          fatTarget: profile.fatTarget,
          name: (await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
          }))?.name,
        }
      : null,
    totals: {
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      water: hydration._sum.amountMl ?? 0,
      sleep: sleep?.hours ?? 0,
      exerciseCalories: exercise._sum.caloriesBurned ?? 0,
    },
    meals,
    hasProfile: !!(
      profile?.heightCm &&
      profile?.weightKg &&
      profile?.activityLevel &&
      profile?.goal
    ),
  });
}
