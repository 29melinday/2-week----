import { getItem, setItem } from "./storage";

const BREATHE_COUNT_KEY = "kindness-breathe-count";

export async function getBreatheCount(): Promise<number> {
  try {
    const raw = await getItem(BREATHE_COUNT_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  } catch {
    return 0;
  }
}

export async function incrementBreatheCount(): Promise<void> {
  try {
    const next = (await getBreatheCount()) + 1;
    await setItem(BREATHE_COUNT_KEY, String(next));
  } catch (_) {}
}
