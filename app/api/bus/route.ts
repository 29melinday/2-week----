import { NextResponse } from "next/server";

// Mock 公車到站資料（無需 TDX key 即可運作）
function getMockEstimates(): { routeName: string; stopName: string; estimateText: string }[] {
  const t = Math.floor(Date.now() / 1000) % 400;
  return [
    { routeName: "307", stopName: "捷運西門站", estimateText: t < 60 ? "進站中" : `${Math.max(1, (t % 5) + 2)} 分` },
    { routeName: "307", stopName: "捷運西門站", estimateText: `${Math.max(3, (t % 7) + 5)} 分` },
    { routeName: "299", stopName: "新莊區公所", estimateText: t < 60 ? "進站中" : `${Math.max(1, (t % 4) + 2)} 分` },
    { routeName: "299", stopName: "新莊區公所", estimateText: `${Math.max(4, (t % 6) + 6)} 分` },
    { routeName: "藍2", stopName: "板橋公車站", estimateText: `${Math.max(2, (t % 5) + 3)} 分` },
    { routeName: "藍2", stopName: "板橋公車站", estimateText: `${Math.max(5, (t % 8) + 7)} 分` },
  ];
}

export async function GET() {
  const data = getMockEstimates();
  return NextResponse.json(data);
}
