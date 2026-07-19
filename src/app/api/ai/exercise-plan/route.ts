import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateExercisePlan } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fitnessLevel, goal, daysPerWeek, workoutDuration, focusAreas } = body;

    const parts: string[] = [];
    if (fitnessLevel) parts.push(`Fitness level: ${fitnessLevel}`);
    if (goal) parts.push(`Goal: ${goal}`);
    if (daysPerWeek) parts.push(`Available ${daysPerWeek} days per week`);
    if (workoutDuration) parts.push(`Workout duration: ${workoutDuration} minutes`);
    if (focusAreas) parts.push(`Focus areas: ${focusAreas}`);

    const result = await generateExercisePlan(parts.join(". ") || "Create a general fitness plan for a beginner.");

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate exercise plan";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
