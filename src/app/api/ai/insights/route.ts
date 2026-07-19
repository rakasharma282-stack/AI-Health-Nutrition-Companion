import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateHealthInsights } from "@/lib/ai";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [weights, hydration, sleep, mood, exercise, meals, profile] =
    await Promise.all([
      prisma.weightLog.findMany({
        where: { userId, date: { gte: fourteenDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.hydrationLog.findMany({
        where: { userId, date: { gte: fourteenDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.sleepLog.findMany({
        where: { userId, date: { gte: fourteenDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.moodLog.findMany({
        where: { userId, date: { gte: fourteenDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.exerciseLog.findMany({
        where: { userId, date: { gte: fourteenDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.mealLog.findMany({
        where: { userId, date: { gte: fourteenDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.healthProfile.findUnique({ where: { userId } }),
    ]);

  // Aggregate meal calories by day
  const mealByDay: Record<string, number> = {};
  for (const m of meals) {
    const day = m.date.toISOString().slice(0, 10);
    mealByDay[day] = (mealByDay[day] || 0) + m.calories;
  }

  const dataSummary = `Health data for the last 14 days:
- Weight logs: ${JSON.stringify(weights.map(w => ({ date: w.date.toISOString().slice(0,10), kg: w.weightKg })))}
- Hydration (ml per day): ${JSON.stringify(hydration.map(h => ({ date: h.date.toISOString().slice(0,10), ml: h.amountMl })))}
- Sleep (hours): ${JSON.stringify(sleep.map(s => ({ date: s.date.toISOString().slice(0,10), hours: s.hours, quality: s.quality })))}
- Mood (1-5): ${JSON.stringify(mood.map(m => ({ date: m.date.toISOString().slice(0,10), mood: m.mood })))}
- Exercise: ${JSON.stringify(exercise.map(e => ({ date: e.date.toISOString().slice(0,10), type: e.type, min: e.durationMin, cal: e.caloriesBurned })))}
- Daily calorie intake: ${JSON.stringify(mealByDay)}
- Daily calorie target: ${profile?.dailyCalorieTarget || "not set"}
- Goal: ${profile?.goal || "maintain"}
`;

  try {
    const insights = await generateHealthInsights(dataSummary);
    return NextResponse.json(insights);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate insights";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
