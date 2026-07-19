import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRecipe, MEDICAL_DISCLAIMER, type RecipeResult } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ingredients, dietType, maxTime, goal, cuisine } = body;

    if (!ingredients && !dietType && !goal) {
      return NextResponse.json(
        { error: "Provide ingredients, diet type, or a goal" },
        { status: 400 },
      );
    }

    const parts: string[] = [];
    if (ingredients) parts.push(`Available ingredients: ${ingredients}`);
    if (dietType) parts.push(`Diet: ${dietType}`);
    if (maxTime) parts.push(`Max cooking time: ${maxTime} minutes`);
    if (goal) parts.push(`Nutrition goal: ${goal}`);
    if (cuisine) parts.push(`Preferred cuisine: ${cuisine}`);

    const result = await generateRecipe(parts.join(". "));

    // Server-side disclaimer injection (deterministic, doesn't rely on LLM)
    if (result.tips) {
      result.tips = `${result.tips}\n\n${MEDICAL_DISCLAIMER}`;
    } else {
      result.tips = MEDICAL_DISCLAIMER;
    }

    // Persist
    const recipe = await prisma.recipe.create({
      data: {
        userId: Number(session.user.id),
        title: result.title,
        content: result as never,
        ingredients: result.ingredients as never,
        nutrition: result.nutrition as never,
        servings: result.servings || 2,
      },
    });

    return NextResponse.json({ ...result, recipeId: recipe.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate recipe";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipes = await prisma.recipe.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ recipes });
}
