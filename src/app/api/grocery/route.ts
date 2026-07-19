import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekString } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const week = getWeekString();
  const userId = Number(session.user.id);

  // Get current week's list
  let list = await prisma.groceryList.findUnique({
    where: { userId_week: { userId, week } },
  });

  if (!list) {
    // Try getting latest meal plan and derive items
    const latestPlan = await prisma.mealPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    let items: Array<{ name: string; qty: string; category: string; checked: boolean }> = [];

    if (latestPlan) {
      const content = latestPlan.content as { meals?: Array<{ ingredients?: string[] }> };
      const allIngredients = (content.meals || []).flatMap((m) => m.ingredients || []);
      const unique = [...new Set(allIngredients.map((i) => i.toLowerCase()))];
      items = unique.map((name) => ({
        name,
        qty: "",
        category: categorize(name),
        checked: false,
      }));
    }

    list = await prisma.groceryList.create({
      data: { userId, week, items: items as never },
    });
  }

  return NextResponse.json({
    week: list.week,
    items: list.items,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items, name, action } = body;
    const week = getWeekString();
    const userId = Number(session.user.id);

    if (action === "add" && name) {
      // Add a single item
      const existing = await prisma.groceryList.findUnique({
        where: { userId_week: { userId, week } },
      });
      const currentItems = (existing?.items as unknown[]) || [];
      const newItem = { name, qty: "", category: categorize(name), checked: false };
      const updatedItems = [...currentItems, newItem];

      await prisma.groceryList.upsert({
        where: { userId_week: { userId, week } },
        create: { userId, week, items: updatedItems as never },
        update: { items: updatedItems as never },
      });
      return NextResponse.json({ ok: true, items: updatedItems });
    }

    // Full update
    await prisma.groceryList.upsert({
      where: { userId_week: { userId, week } },
      create: { userId, week, items: (items || []) as never },
      update: { items: (items || []) as never },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function categorize(name: string): string {
  const n = name.toLowerCase();
  if (/(rice|flour|bread|oats|quinoa|pasta|noodle|grain|roti|wheat)/.test(n)) return "Grains";
  if (/(chicken|fish|egg|meat|salmon|tuna|beef|mutton|paneer|tofu)/.test(n)) return "Protein";
  if (/(milk|yogurt|curd|cheese|cream|butter|ghee)/.test(n)) return "Dairy";
  if (/(tomato|onion|potato|spinach|carrot|broccoli|cucumber|ginger|garlic|chili|coriander|vegetable|leaf)/.test(n)) return "Vegetables";
  if (/(apple|banana|orange|mango|grape|berry|fruit|lemon|lime)/.test(n)) return "Fruits";
  if (/(dal|lentil|chickpea|bean|pea|legume)/.test(n)) return "Legumes";
  if (/(oil|salt|sugar|honey|spice|turmeric|cumin|masala|pepper)/.test(n)) return "Pantry";
  if (/(almond|walnut|cashew|nut|seed)/.test(n)) return "Nuts & Seeds";
  return "Other";
}
