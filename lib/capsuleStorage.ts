export const CAPSULE_LIST_KEY = "kindness-capsules";

export interface CapsuleEntry {
  key: string;
  unlockAt: number;
  opened?: boolean;
  content?: string;
  createdAt?: number;
}

export function getCapsuleList(): CapsuleEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CAPSULE_LIST_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveCapsuleList(list: CapsuleEntry[]) {
  try {
    localStorage.setItem(CAPSULE_LIST_KEY, JSON.stringify(list));
  } catch (_) {}
}

export function getReadyToOpenCount(): number {
  const now = Date.now();
  return getCapsuleList().filter((e) => !e.opened && e.unlockAt <= now).length;
}

export function getCapsuleContent(key: string): { content: string; unlockAt: number } | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return { content: data.content, unlockAt: data.unlockAt };
  } catch {
    return null;
  }
}

export function markCapsuleOpened(key: string, content: string) {
  const list = getCapsuleList();
  const idx = list.findIndex((e) => e.key === key);
  if (idx >= 0) {
    list[idx] = { ...list[idx], opened: true, content };
    saveCapsuleList(list);
  }
}
