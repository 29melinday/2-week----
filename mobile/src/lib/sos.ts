import { SOS_KEYWORDS } from "./constants";

export function checkSOS(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const normalized = text.trim();
  return SOS_KEYWORDS.some((keyword) => normalized.includes(keyword));
}
