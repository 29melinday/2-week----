import { NextRequest, NextResponse } from "next/server";
import { sendToGemini, XIAOXIAO_SYSTEM } from "@/lib/gemini";

const FALLBACK_REPLY = "我現在無法連線到 AI，但我在聽。你願意多說一點嗎？";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ text: FALLBACK_REPLY });
    }
    const body = await req.json();
    const { messages } = body as { messages: { role: string; text: string }[] };
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }
    const formatted = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })) as { role: "user" | "model"; parts: { text: string }[] }[];
    const text = await sendToGemini(apiKey, formatted, XIAOXIAO_SYSTEM);
    return NextResponse.json({ text });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
