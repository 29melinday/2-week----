import { getItem, setItem, removeItem } from "./storage";

const TUTORIAL_DONE_KEY = "kindness-tutorial-done";

export async function tutorialDone(): Promise<boolean> {
  const v = await getItem(TUTORIAL_DONE_KEY);
  return v === "1";
}

export async function setTutorialDone(): Promise<void> {
  await setItem(TUTORIAL_DONE_KEY, "1");
}

export async function clearTutorialDone(): Promise<void> {
  await removeItem(TUTORIAL_DONE_KEY);
}
