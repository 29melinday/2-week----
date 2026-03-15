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
  onClose: () => void;
}

const STEPS = [
  {
    title: "歡迎使用 行善台北",
    body: "這個畫面看起來是公車動態，可以低調使用。接下來會一步一步介紹如何進入小曉的空間，以及裡面的每個功能。",
    hint: "",
  },
  {
    title: "第一步：打開秘密入口",
    body: "在畫面下方找到「更新時間：1分鐘前」那一行，用手指「長按約 3 秒」不要放開，就會跳出計算機。",
    hint: "長按 3 秒 → 計算機出現",
  },
  {
    title: "第二步：輸入進入密碼",
    body: "計算機出現後，在計算機上依序輸入您的進入密碼。輸入正確後會出現水波動畫，並進入小曉介面。",
    hint: "可在「設定」中更改密碼",
  },
  {
    title: "小曉與聊天",
    body: "中間的發光圓球就是小曉，您的數位陪伴。在下方輸入框打字、按送出，就能和小曉聊天。小曉會傾聽並回應您。",
    hint: "",
  },
  {
    title: "心情河流",
    body: "畫面上方有一條「心情河流」。點「記錄心情」可以選一種當下的情緒，像一顆石頭一樣放進河裡。這些記錄會保存下來，幫助您看見自己的狀態。",
    hint: "",
  },
  {
    title: "呼吸定錨",
    body: "點下方「呼吸練習」可進入 4-7-8 呼吸法：吸氣 4 秒、屏息 7 秒、吐氣 8 秒。圓球會跟著節奏變大變小，幫助您安定下來。",
    hint: "",
  },
  {
    title: "時光膠囊",
    body: "「時光膠囊」讓您寫一封信給 30 天後的自己。封存後要等 30 天才能打開，到時可以回顧當時的心情與想法。",
    hint: "",
  },
  {
    title: "資源地圖",
    body: "「資源地圖」會依您的位置列出台北市的心理與諮商資源，由近到遠排序。需要時可以一鍵導航或撥打專線。",
    hint: "生命線 1995、張老師 1980、安心專線 1925",
  },
  {
    title: "我的紀錄",
    body: "「我的紀錄」可以看到您記錄過的心情比例、做過幾次呼吸練習、寫了幾個時光膠囊，讓您看見自己照顧自己的足跡。",
    hint: "",
  },
  {
    title: "設定與返回公車",
    body: "「設定」裡可以自訂進入密碼、介面主色、小曉光球的漸層顏色。畫面上方「返回公車」可隨時回到這個公車畫面，別人只會看到公車動態。",
    hint: "隨時可低調離開",
  },
  {
    title: "準備好了",
    body: "您已經認識行善台北的每個功能。需要時就長按進入，和小曉說說話、記一下心情，或做個呼吸練習。",
    hint: "祝您一切安好",
  },
];

export default function TutorialOverlay({ visible, onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [unlockCode, setUnlockCode] = useState("110#");

  useEffect(() => {
    if (visible) setUnlockCode(getSettings().unlockCode || "110#");
  }, [visible]);

  const content = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleNext = () => {
    if (isLast) {
      setTutorialDone();
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) setStep((s) => s - 1);
  };

  const handleSkip = () => {
    setTutorialDone();
    onClose();
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && handleSkip()}
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
          className="glass-card rounded-3xl p-8 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold text-twilight-amber mb-4">{content.title}</h2>
          <p className="text-twilight-text/95 text-base leading-relaxed mb-4 min-h-[4.5em]">
            {content.body}
          </p>
          {step === 2 && (
            <p className="text-twilight-muted text-sm mb-4">目前密碼：{unlockCode}</p>
          )}
          {content.hint && (
            <p className="text-twilight-muted/90 text-sm italic mb-6">{content.hint}</p>
          )}

          <div className="flex items-center justify-between gap-3 mt-6">
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-2xl px-4 py-2.5 text-twilight-text border border-white/20 bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                >
                  上一步
                </button>
              )}
              <button
                type="button"
                onClick={handleSkip}
                className="text-twilight-muted hover:text-twilight-text text-sm"
              >
                略過
              </button>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-2xl px-6 py-2.5 bg-white/15 border border-white/20 text-twilight-text font-medium text-sm hover:bg-white/25 transition-colors"
            >
              {isLast ? "開始使用" : "下一步"}
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "bg-twilight-amber w-5" : "bg-white/30 w-1.5"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
