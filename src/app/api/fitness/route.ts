import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// MET values for common exercises (Metabolic Equivalent of Task)
const MET_VALUES: Record<string, number> = {
  walking: 3.5,
  running: 9.8,
  cycling: 7.5,
  yoga: 3.0,
  "strength training": 6.0,
  "home workout": 5.0,
  stretching: 2.3,
  hiit: 8.0,
  meditation: 1.0,
  swimming: 7.0,
  dancing: 5.0,
  hiking: 6.0,
  "weight lifting": 6.0,
};

function estimateCalories(type: string, durationMin: number, weightKg: number, intensity: string): number {
  const met = MET_VALUES[type.toLowerCase()] ?? 5.0;
  const intensityMult = intensity === "vigorous" ? 1.3 : intensity === "light" ? 0.7 : 1.0;
  return (met * 3.5 * weightKg / 200) * durationMin * intensityMult;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [logs, profile, weekTotal] = await Promise.all([
    prisma.exerciseLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.healthProfile.findUnique({ where: { userId } }),
    prisma.exerciseLog.aggregate({
      where: {
        userId,
        date: { gte: sevenDaysAgo },
      },
      _sum: { caloriesBurned: true },
    }),
  ]);

  return NextResponse.json({
    logs,
    weightKg: profile?.weightKg || 70,
    weekTotal: weekTotal._sum.caloriesBurned ?? 0,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, durationMin, intensity, date } = body;

    if (!type || !durationMin) {
      return NextResponse.json(
        { error: "Exercise type and duration are required" },
        { status: 400 },
      );
    }

    const userId = Number(session.user.id);
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });
    const weightKg = profile?.weightKg || 70;

    const caloriesBurned = estimateCalories(
      type,
      Number(durationMin),
      weightKg,
      intensity || "moderate",
    );

    const log = await prisma.exerciseLog.create({
      data: {
        userId,
        type,
        durationMin: Number(durationMin),
        intensity: intensity || "moderate",
        caloriesBurned: Math.round(caloriesBurned),
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ ok: true, log });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to log exercise";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, {status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.exerciseLog.deleteMany({
    where: { id, userId: Number(session.user.id) },
  });
  return NextResponse.json({ ok: true });
}
