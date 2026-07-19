import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.foodItem.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { brand: { contains: q } },
        { barcode: { contains: q } },
      ],
    },
    take: limit,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ items });
}
