import { getItem, setItem } from "./storage";
import type { MoodStone } from "../types";

const MOODS_KEY = "kindness-mood-stones";

export async function getMoodStones(): Promise<MoodStone[]> {
  try {
    const raw = await getItem(MOODS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveMoodStones(stones: MoodStone[]): Promise<void> {
  try {
    await setItem(MOODS_KEY, JSON.stringify(stones));
  } catch (_) {}
}
