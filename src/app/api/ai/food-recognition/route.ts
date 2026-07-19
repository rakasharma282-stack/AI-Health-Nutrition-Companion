import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recognizeFoodFromImage, MEDICAL_DISCLAIMER } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 10MB" },
        { status: 400 },
      );
    }

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const result = await recognizeFoodFromImage(base64, file.type);

    return NextResponse.json({
      ...result,
      disclaimer: MEDICAL_DISCLAIMER,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Food recognition failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
