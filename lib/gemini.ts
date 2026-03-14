/**
 * Gemini 整合（可接 1.5 Pro / 4o 或 Multimodal Live API）
 * 需設定 NEXT_PUBLIC_GEMINI_API_KEY 或於 API route 使用 server-side key
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function sendToGemini(
  apiKey: string,
  messages: ChatMessage[],
  systemInstruction?: string
): Promise<string> {
  const model = "gemini-1.5-flash";
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;
  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: m.parts,
  }));
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: systemInstruction
        ? { parts: [{ text: systemInstruction }] }
        : undefined,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

/** 小曉系統提示（共情、不說教、像大哥哥/大姊姊） */
export const XIAOXIAO_SYSTEM =
  "你是「小曉」，一位溫暖、不說教、像大哥哥/大姊姊般的數位陪伴者。對象是 12-25 歲可能處於高壓或絕望的青少年。請用簡短、接納、不評判的方式回應，多傾聽、少給建議，除非對方主動詢問。若感到對方需要專業協助，溫和提醒可撥打 1925 安心專線。";
