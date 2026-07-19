import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatWithAssistant, MEDICAL_DISCLAIMER } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message, threadId } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const userId = Number(session.user.id);

    // Get or create thread
    let thread = null;
    if (threadId) {
      thread = await prisma.chatThread.findFirst({
        where: { id: Number(threadId), userId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }
    if (!thread) {
      thread = await prisma.chatThread.create({
        data: {
          userId,
          title: message.slice(0, 50),
          messages: { create: [] },
        },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        role: "user",
        content: message,
      },
    });

    // Get AI response
    const history = thread.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const reply = await chatWithAssistant(message, history);

    // Server-side disclaimer enforcement: append if LLM omitted it
    const finalReply = reply.includes("⚠️") || reply.includes("medical advice")
      ? reply
      : `${reply}\n\n${MEDICAL_DISCLAIMER}`;

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        role: "assistant",
        content: finalReply,
      },
    });

    return NextResponse.json({
      reply: finalReply,
      threadId: thread.id,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chat failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
