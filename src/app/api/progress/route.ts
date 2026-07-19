import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [weights, hydration, sleep, mood, exercise, profile, todayHydration] =
    await Promise.all([
      prisma.weightLog.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.hydrationLog.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.sleepLog.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.moodLog.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.exerciseLog.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.healthProfile.findUnique({ where: { userId } }),
      prisma.hydrationLog.aggregate({
        where: {
          userId,
          date: { gte: startOfDay() },
        },
        _sum: { amountMl: true },
      }),
    ]);

  return NextResponse.json({
    weight: weights,
    hydration,
    sleep,
    mood,
    exercise,
    profile,
    todayHydration: todayHydration._sum.amountMl ?? 0,
  });
}

// Generic logger for weight / hydration / sleep / mood
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, value, quality, note, date } = body;
    const userId = Number(session.user.id);
    const logDate = date ? new Date(date) : new Date();

    let record;
    switch (type) {
      case "weight":
        record = await prisma.weightLog.create({
          data: { userId, weightKg: Number(value), date: logDate },
        });
        // Update profile weight too
        await prisma.healthProfile.update({
          where: { userId },
          data: { weightKg: Number(value) },
        }).catch(() => {});
        break;
      case "hydration":
        record = await prisma.hydrationLog.create({
          data: { userId, amountMl: Number(value), date: logDate },
        });
        break;
      case "sleep":
        record = await prisma.sleepLog.create({
          data: {
            userId,
            hours: Number(value),
            quality: Number(quality) || 3,
            date: logDate,
          },
        });
        break;
      case "mood":
        record = await prisma.moodLog.create({
          data: {
            userId,
            mood: Number(value),
            note: note || null,
            date: logDate,
          },
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, record });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to log";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
