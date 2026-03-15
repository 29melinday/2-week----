const BREATHE_COUNT_KEY = "kindness-breathe-count";

export function getBreatheCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(BREATHE_COUNT_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  } catch {
    return 0;
  }
}

export function incrementBreatheCount(): void {
  try {
    const next = getBreatheCount() + 1;
    localStorage.setItem(BREATHE_COUNT_KEY, String(next));
  } catch (_) {}
}
