import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeProfileTargets } from "@/app/api/auth/register/route";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.healthProfile.findUnique({
    where: { userId: Number(session.user.id) },
  });
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { id: true, email: true, name: true, image: true, role: true },
  });

  return NextResponse.json({ user, profile });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = Number(session.user.id);

    // Update user name if provided
    if (typeof body.name === "string" && body.name.trim()) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: body.name.trim() },
      });
    }

    const profileData: Record<string, unknown> = {};

    const fields = [
      "dateOfBirth",
      "gender",
      "heightCm",
      "weightKg",
      "activityLevel",
      "dietType",
      "allergies",
      "goal",
      "targetWeightKg",
      "preferredCuisine",
    ] as const;

    for (const f of fields) {
      if (body[f] !== undefined && body[f] !== "") {
        if (f === "dateOfBirth") {
          profileData[f] = new Date(body[f]);
        } else if (
          ["heightCm", "weightKg", "targetWeightKg"].includes(f)
        ) {
          profileData[f] = parseFloat(body[f]);
        } else {
          profileData[f] = body[f];
        }
      }
    }

    await prisma.healthProfile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
    });

    // Recompute BMR / calorie target / macros
    const updated = await recomputeProfileTargets(userId);

    return NextResponse.json({ ok: true, profile: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
