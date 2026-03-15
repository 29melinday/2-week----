"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSettings } from "@/lib/settingsStorage";

const TUTORIAL_DONE_KEY = "kindness-tutorial-done";

export function tutorialDone(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TUTORIAL_DONE_KEY) === "1";
}

export function setTutorialDone(): void {
  try {
    localStorage.setItem(TUTORIAL_DONE_KEY, "1");
  } catch (_) {}
}

export function clearTutorialDone(): void {
  try {
    localStorage.removeItem(TUTORIAL_DONE_KEY);
  } catch (_) {}
}

interface TutorialOverlayProps {
  visible: boolean;
  step: number;
  setStep: (n: number | ((prev: number) => number)) => void;
  onClose: () => void;
  showWhenSteps: number[];
  accentColor?: string;
}

const STEP_CONTENT: Record<number, { title: string; body: string; hint: string; actionLabel?: string }> = {
  0: {
    title: "歡迎使用 行善台北",
    body: "這個畫面看起來是公車動態，可以低調使用。接下來請跟著指示「實際操作」每個步驟。",
    hint: "按「下一步」開始",
  },
  1: {
    title: "第一步：打開秘密入口",
    body: "請在畫面「最下方」找到「更新時間：1分鐘前」，用手指「長按約 3 秒」不要放開。",
    hint: "長按 3 秒後會自動跳出計算機",
    actionLabel: "請長按下方文字 3 秒",
  },
  2: {
    title: "第二步：輸入進入密碼",
    body: "在計算機上依序輸入您的進入密碼（例如 110#），輸入正確後會進入小曉介面。",
    hint: "可在「設定」中更改密碼",
    actionLabel: "請在計算機輸入密碼",
  },
  3: {
    title: "小曉與聊天",
    body: "左下角的發光圓球就是小曉。在輸入框打字、按「送出」，就能和小曉聊天。請試著送出一則訊息。",
    hint: "",
    actionLabel: "試試：輸入並送出訊息",
  },
  4: {
    title: "心情河流",
    body: "畫面上方有「心情河流」。點「記錄心情」選一種當下的情緒，像石頭放進河裡。請點一下「記錄心情」試試。",
    hint: "",
    actionLabel: "試試：點「記錄心情」",
  },
  5: {
    title: "呼吸定錨",
    body: "點下方「呼吸」可進入 4-7-8 呼吸法，圓球會跟著節奏變大變小。請點「呼吸」試試。",
    hint: "",
    actionLabel: "試試：點「呼吸」",
  },
  6: {
    title: "時光膠囊",
    body: "「膠囊」讓您寫一封信給 30 天後的自己。請點「膠囊」看看。",
    hint: "",
    actionLabel: "試試：點「膠囊」",
  },
  7: {
    title: "資源地圖",
    body: "「地圖」會依您的位置列出台北市心理與諮商資源。請點「地圖」看看。",
    hint: "生命線 1995、張老師 1980、安心專線 1925",
    actionLabel: "試試：點「地圖」",
  },
  8: {
    title: "我的紀錄",
    body: "「紀錄」可看心情比例、呼吸次數、膠囊數。請點「紀錄」看看。",
    hint: "",
    actionLabel: "試試：點「紀錄」",
  },
  9: {
    title: "設定與返回公車",
    body: "「設定」可自訂密碼與顏色。畫面上方「返回公車」可隨時回到公車畫面。請點「設定」看看。",
    hint: "隨時可低調離開",
    actionLabel: "試試：點「設定」",
  },
  10: {
    title: "準備好了",
    body: "您已經認識每個功能。需要時就長按進入，和小曉說說話、記一下心情，或做個呼吸練習。",
    hint: "祝您一切安好",
  },
};

export default function TutorialOverlay({
  visible,
  step,
  setStep,
  onClose,
  showWhenSteps,
  accentColor: accentProp,
}: TutorialOverlayProps) {
  const [unlockCode, setUnlockCode] = useState("110#");
  const accentColor = accentProp ?? getSettings().accentColor;

  useEffect(() => {
    if (visible) setUnlockCode(getSettings().unlockCode || "110#");
  }, [visible]);

  const show = visible && showWhenSteps.includes(step);
  const content = STEP_CONTENT[step];
  const isFirst = step === 0;
  const isLast = step === 10;
  const isActionStep = step === 1 || step === 2 || (step >= 3 && step <= 9);

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else if (isFirst) {
      setStep(1);
    }
  };

  if (!show || !content) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/25 pointer-events-none"
        aria-hidden
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
          className="glass-card rounded-3xl p-8 max-w-md w-full shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: accentColor }}>
            {content.title}
          </h2>
          <p className="text-twilight-text/95 text-base leading-relaxed mb-2 min-h-[3.5em]">
            {content.body}
          </p>
          {step === 2 && (
            <p className="text-twilight-muted text-sm mb-4">目前密碼：{unlockCode}</p>
          )}
          {content.hint && (
            <p className="text-twilight-muted/90 text-sm italic mb-4">{content.hint}</p>
          )}
          {content.actionLabel && (
            <p className="text-sm font-medium mb-4 rounded-xl py-2 px-3 border border-white/20 bg-white/5" style={{ color: accentColor }}>
              → {content.actionLabel}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 mt-6">
            <div className="flex items-center gap-2">
              {!isFirst && step <= 2 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="rounded-2xl px-4 py-2.5 text-twilight-text border border-white/20 bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                >
                  上一步
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-twilight-muted hover:text-twilight-text text-sm"
              >
                略過
              </button>
            </div>
            {(isFirst || isLast) && (
              <button
                type="button"
                onClick={isLast ? onClose : handleNext}
                className="rounded-2xl px-6 py-2.5 border text-sm font-medium transition-colors"
                style={{
                  color: accentColor,
                  borderColor: `${accentColor}66`,
                  backgroundColor: `${accentColor}15`,
                }}
              >
                {isLast ? "開始使用" : "下一步"}
              </button>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === step ? 20 : 6,
                  backgroundColor: i === step ? accentColor : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
