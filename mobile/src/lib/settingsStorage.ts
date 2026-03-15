import { getItem, setItem } from "./storage";

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

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await getItem(SETTINGS_KEY);
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

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const next = { ...current, ...settings };
    await setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch (_) {}
}
