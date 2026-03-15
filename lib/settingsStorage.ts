const SETTINGS_KEY = "kindness-settings";

export interface AppSettings {
  unlockCode: string;
  accentColor: string;
  orbColor: string;
  orbColorSecond: string;
}

const DEFAULT: AppSettings = {
  unlockCode: "110#",
  accentColor: "#F2C94C",
  orbColor: "#F2C94C",
  orbColorSecond: "#BB9AF7",
};

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      unlockCode: parsed.unlockCode ?? DEFAULT.unlockCode,
      accentColor: parsed.accentColor ?? DEFAULT.accentColor,
      orbColor: parsed.orbColor ?? DEFAULT.orbColor,
      orbColorSecond: parsed.orbColorSecond ?? DEFAULT.orbColorSecond,
    };
  } catch {
    return DEFAULT;
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  try {
    const current = getSettings();
    const next = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch (_) {}
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 242, g: 201, b: 76 };
}
