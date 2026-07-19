import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  const meals = await prisma.mealLog.findMany({
    where: {
      userId: Number(session.user.id),
      date: { gte: startOfDay(date), lte: endOfDay(date) },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ meals });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      foodItemId,
      photoUrl,
      source,
      mealType,
      quantity,
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
    } = body;

    if (!mealType || !name || calories === undefined) {
      return NextResponse.json(
        { error: "mealType, name, and calories are required" },
        { status: 400 },
      );
    }

    const meal = await prisma.mealLog.create({
      data: {
        userId: Number(session.user.id),
        foodItemId: foodItemId ?? null,
        photoUrl: photoUrl ?? null,
        source: source || "search",
        mealType,
        quantity: quantity ?? 1,
        date: new Date(),
        name,
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: fiber ? Number(fiber) : null,
        sugar: sugar ? Number(sugar) : null,
        sodium: sodium ? Number(sodium) : null,
      },
    });

    return NextResponse.json({ ok: true, meal });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to log meal";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.mealLog.deleteMany({
    where: { id, userId: Number(session.user.id) },
  });

  return NextResponse.json({ ok: true });
}
