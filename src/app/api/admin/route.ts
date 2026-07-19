import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsers,
    premiumUsers,
    activeThisWeek,
    totalMeals,
    totalFoodItems,
    totalMealPlans,
    totalExerciseLogs,
    totalRecipes,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PREMIUM" } }),
    prisma.user.count({
      where: {
        mealLogs: { some: { date: { gte: sevenDaysAgo } } },
      },
    }),
    prisma.mealLog.count(),
    prisma.foodItem.count(),
    prisma.mealPlan.count(),
    prisma.exerciseLog.count(),
    prisma.recipe.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            mealLogs: true,
            exerciseLogs: true,
            mealPlans: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalUsers,
      premiumUsers,
      activeThisWeek,
      totalMeals,
      totalFoodItems,
      totalMealPlans,
      totalExerciseLogs,
      totalRecipes,
    },
    recentUsers,
  });
}
