import { getCapsuleList } from "./capsuleStorage";

const SETTINGS_KEY = "kindness-settings";
const CAPSULE_LIST_KEY = "kindness-capsules";
const MOODS_KEY = "kindness-mood-stones";
const BREATHE_COUNT_KEY = "kindness-breathe-count";
const TUTORIAL_DONE_KEY = "kindness-tutorial-done";

/**
 * Clears all app data: capsules (list + each capsule content), mood stones,
 * breathe count, tutorial flag, and UI settings. Restores defaults on next load.
 */
export function clearAllAppData(): void {
  try {
    const list = getCapsuleList();
    list.forEach((e) => localStorage.removeItem(e.key));
    localStorage.removeItem(CAPSULE_LIST_KEY);
    localStorage.removeItem(MOODS_KEY);
    localStorage.removeItem(BREATHE_COUNT_KEY);
    localStorage.removeItem(TUTORIAL_DONE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (_) {}
}
