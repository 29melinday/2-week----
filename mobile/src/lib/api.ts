/**
 * Set API_BASE to your deployed Next.js URL (e.g. https://your-app.vercel.app)
 * or use a tunnel (ngrok) when testing locally. Chat and bus endpoints: /api/chat, /api/bus
 */
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "";

export async function fetchChat(messages: { role: string; text: string }[]): Promise<string> {
  if (!API_BASE) return "我在聽。你願意多說一點嗎？";
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    return res.ok && data?.text ? data.text : "我在聽。你願意多說一點嗎？";
  } catch {
    return "我在聽。你願意多說一點嗎？";
  }
}

export async function fetchBus(): Promise<{ routeName: string; stopName: string; estimateText: string }[]> {
  if (!API_BASE) {
    return [
      { routeName: "307", stopName: "捷運西門站", estimateText: "3 分" },
      { routeName: "307", stopName: "捷運西門站", estimateText: "8 分" },
      { routeName: "299", stopName: "新莊區公所", estimateText: "2 分" },
      { routeName: "藍2", stopName: "板橋公車站", estimateText: "4 分" },
    ];
  }
  try {
    const res = await fetch(`${API_BASE}/api/bus`);
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [
      { routeName: "307", stopName: "捷運西門站", estimateText: "3 分" },
      { routeName: "299", stopName: "新莊區公所", estimateText: "2 分" },
      { routeName: "藍2", stopName: "板橋公車站", estimateText: "4 分" },
    ];
  }
}
