// 台北公車預估到站 - 可接 TDX API，此處為 mock 以利無 key 時運作
const TDX_BASE = "https://tdx.transportdata.tw/api/basic/v2/Bus/EstimatedTimeOfArrival/City/Taipei";

export interface BusEstimate {
  routeName: string;
  stopName: string;
  direction: number;
  estimate: number; // 秒
  plateNumb?: string;
}

// Mock 資料（若未設定 TDX Client ID 則使用）
function getMockEstimates(): BusEstimate[] {
  const now = Date.now();
  return [
    { routeName: "307", stopName: "捷運西門站", direction: 0, estimate: Math.floor((now % 300) + 120) },
    { routeName: "307", stopName: "捷運西門站", direction: 0, estimate: Math.floor((now % 400) + 380) },
    { routeName: "299", stopName: "新莊區公所", direction: 0, estimate: Math.floor((now % 280) + 90) },
    { routeName: "299", stopName: "新莊區公所", direction: 0, estimate: Math.floor((now % 350) + 320) },
    { routeName: "藍2", stopName: "板橋公車站", direction: 0, estimate: Math.floor((now % 260) + 60) },
    { routeName: "藍2", stopName: "板橋公車站", direction: 0, estimate: Math.floor((now % 400) + 280) },
  ];
}

function formatEstimate(sec: number): string {
  if (sec <= 0) return "進站中";
  if (sec < 60) return `${sec} 秒`;
  const min = Math.floor(sec / 60);
  return `${min} 分`;
}

export async function fetchBusEstimates(): Promise<{ routeName: string; stopName: string; estimateText: string }[]> {
  const clientId = process.env.NEXT_PUBLIC_TDX_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_TDX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const mock = getMockEstimates();
    return mock.slice(0, 6).map((m) => ({
      routeName: m.routeName,
      stopName: m.stopName,
      estimateText: formatEstimate(m.estimate),
    }));
  }

  try {
    const tokenRes = await fetch("https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const { access_token } = await tokenRes.json();
    const res = await fetch(`${TDX_BASE}/307?$top=3`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const data = (await res.json()) as BusEstimate[];
    const list = (data || []).slice(0, 6).map((d) => ({
      routeName: d.routeName || "307",
      stopName: d.stopName|| "捷運西門站",
      estimateText: formatEstimate(d.estimate ?? 0),
    }));
    return list.length ? list : getMockEstimates().slice(0, 6).map((m) => ({
      routeName: m.routeName,
      stopName: m.stopName,
      estimateText: formatEstimate(m.estimate),
    }));
  } catch {
    const mock = getMockEstimates();
    return mock.slice(0, 6).map((m) => ({
      routeName: m.routeName,
      stopName: m.stopName,
      estimateText: formatEstimate(m.estimate),
    }));
  }
}
