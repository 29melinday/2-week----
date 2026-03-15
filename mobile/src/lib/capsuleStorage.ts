import { getItem, setItem } from "./storage";

export const CAPSULE_LIST_KEY = "kindness-capsules";

export interface CapsuleEntry {
  key: string;
  unlockAt: number;
  opened?: boolean;
  content?: string;
  createdAt?: number;
}

export async function getCapsuleList(): Promise<CapsuleEntry[]> {
  try {
    const raw = await getItem(CAPSULE_LIST_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveCapsuleList(list: CapsuleEntry[]): Promise<void> {
  try {
    await setItem(CAPSULE_LIST_KEY, JSON.stringify(list));
  } catch (_) {}
}

export async function getReadyToOpenCount(): Promise<number> {
  const now = Date.now();
  const list = await getCapsuleList();
  return list.filter((e) => !e.opened && e.unlockAt <= now).length;
}

export async function getCapsuleContent(key: string): Promise<{ content: string; unlockAt: number } | null> {
  try {
    const raw = await getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return { content: data.content, unlockAt: data.unlockAt };
  } catch {
    return null;
  }
}

export async function markCapsuleOpened(key: string, content: string): Promise<void> {
  const list = await getCapsuleList();
  const idx = list.findIndex((e) => e.key === key);
  if (idx >= 0) {
    list[idx] = { ...list[idx], opened: true, content };
    await saveCapsuleList(list);
  }
}
