// SOS 關鍵字列表（最高權限攔截）
export const SOS_KEYWORDS = [
  "自殺",
  "想死",
  "走掉",
  "結束",
  "沒意義",
  "吞藥",
  "跳樓",
  "割腕",
  "遺書",
  "最後一次",
  "頂樓",
  "軌道",
  "不想活",
  "活不下去",
  "橋",
  "跳",
  "死",
];

// 壓力/慌張關鍵字 → 可觸發呼吸引導
export const STRESS_KEYWORDS = [
  "我很慌",
  "氣喘不過來",
  "呼吸不過來",
  "好緊張",
  "快崩潰",
  "喘不過氣",
];

// 公車路線（偽裝用）
export const BUS_ROUTES = [
  { id: "307", name: "307", from: "板橋前站", to: "莊敬里", routeId: "TPE16111" },
  { id: "299", name: "299", from: "新莊", to: "永春高中", routeId: "TPE11411" },
  { id: "藍2", name: "藍2", from: "西盛", to: "二二八和平公園", routeId: "10281" },
];

// 心情標籤與顏色（情緒河流）
export const MOOD_COLORS: Record<string, string> = {
  calm: "#7eb8da",
  sad: "#5c6bc0",
  anxious: "#ffb74d",
  angry: "#e57373",
  hopeful: "#81c784",
  tired: "#a1887f",
  okay: "#c9a86c",
  other: "#9e9e9e",
};
