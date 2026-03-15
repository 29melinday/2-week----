"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import XiaoXiaoOrb from "./XiaoXiaoOrb";
import MoodRiver, { MoodStone } from "./MoodRiver";
import SOSOverlay from "./SOSOverlay";
import BreatheMode from "./BreatheMode";
import TimeCapsule from "./TimeCapsule";
import ResourceMap from "./ResourceMap";
import StatsView from "./StatsView";
import SettingsView from "./SettingsView";
import TutorialOverlay from "./TutorialOverlay";
import { checkSOS } from "@/lib/sos";
import { getSettings } from "@/lib/settingsStorage";
import { clearTutorialDone } from "./TutorialOverlay";
import { incrementBreatheCount } from "@/lib/statsStorage";
import { STRESS_KEYWORDS } from "@/lib/constants";
import { getReadyToOpenCount } from "@/lib/capsuleStorage";

const STORAGE_KEY_MOODS = "kindness-mood-stones";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

const TUTORIAL_HINT: Record<number, string> = {
  3: "試試：輸入並送出訊息",
  4: "試試：點「記錄心情」",
  5: "試試：點「呼吸」",
  6: "試試：點「膠囊」",
  7: "試試：點「地圖」",
  8: "試試：點「紀錄」",
  9: "試試：點「設定」",
};

interface XiaoXiaoViewProps {
  onBackToBus?: () => void;
  tutorialStep?: number;
  setTutorialStep?: (n: number | ((prev: number) => number)) => void;
  showTutorial?: boolean;
  onTutorialComplete?: () => void;
  onRequestShowTutorial?: () => void;
}

function loadStones(): MoodStone[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOODS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function XiaoXiaoView({
  onBackToBus,
  tutorialStep = 0,
  setTutorialStep,
  showTutorial = false,
  onTutorialComplete,
  onRequestShowTutorial,
}: XiaoXiaoViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [stones, setStones] = useState<MoodStone[]>(loadStones);
  const [sosVisible, setSosVisible] = useState(false);
  const [breatheVisible, setBreatheVisible] = useState(false);
  const [capsuleVisible, setCapsuleVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [readyCapsuleCount, setReadyCapsuleCount] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [accentColor, setAccentColor] = useState(getSettings().accentColor);
  const [orbColor, setOrbColor] = useState(getSettings().orbColor);
  const [orbColorSecond, setOrbColorSecond] = useState(getSettings().orbColorSecond);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const checkAndTriggerSOS = useCallback((text: string) => {
    if (checkSOS(text)) setSosVisible(true);
  }, []);

  const checkStress = useCallback((text: string) => {
    if (STRESS_KEYWORDS.some((k) => text.includes(k))) setBreatheVisible(true);
  }, []);

  const addStone = useCallback((moodId: string, color: string) => {
    setStones((s) => {
      const next = [
        ...s,
        { id: `stone-${Date.now()}`, moodId, color, createdAt: Date.now() },
      ];
      try {
        localStorage.setItem(STORAGE_KEY_MOODS, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  }, []);

  useEffect(() => {
    if (stones.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY_MOODS, JSON.stringify(stones));
    } catch (_) {}
  }, [stones]);

  useEffect(() => {
    setReadyCapsuleCount(getReadyToOpenCount());
  }, [capsuleVisible]);

  useEffect(() => {
    const s = getSettings();
    setAccentColor(s.accentColor);
    setOrbColor(s.orbColor);
    setOrbColorSecond(s.orbColorSecond);
  }, [settingsVisible]);

  const scrollToTop = useCallback(() => {
    chatScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 120);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to very bottom when new messages appear
  useEffect(() => {
    if (messages.length === 0) return;
    const el = chatScrollRef.current;
    if (!el) return;
    const forceBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    const rafId = requestAnimationFrame(() => {
      forceBottom();
      setTimeout(forceBottom, 0);
      setTimeout(forceBottom, 100);
      setTimeout(forceBottom, 350);
    });
    return () => cancelAnimationFrame(rafId);
  }, [messages.length, messages[messages.length - 1]?.id]);

  const sendMessage = useCallback(async () => {
    const t = input.trim();
    if (!t) return;
    if (showTutorial && tutorialStep === 3) setTutorialStep?.(4);
    checkAndTriggerSOS(t);
    checkStress(t);
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: t,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsSpeaking(true);
    const history = [...messages, userMsg].map((m) => ({ role: m.role, text: m.text }));
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const reply = res.ok && data?.text ? data.text : "我在聽。你願意多說一點嗎？";
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: reply,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: "我在聽。你願意多說一點嗎？",
          timestamp: Date.now(),
        },
      ]);
    }
    setTimeout(() => setIsSpeaking(false), 1200);
  }, [input, messages, checkAndTriggerSOS, checkStress, showTutorial, tutorialStep, setTutorialStep]);

  return (
    <>
      <div className="min-h-screen bg-twilight-bg flex flex-col overflow-x-hidden">
        {/* 固定頂列：返回公車（不隨捲動消失） */}
        {onBackToBus && (
          <div className="sticky top-0 z-20 shrink-0 bg-twilight-bg/95 backdrop-blur border-b border-white/10">
            <button
              type="button"
              onClick={onBackToBus}
              className="w-full py-3 px-4 text-left hover:bg-white/5 text-sm font-normal rounded-none transition-colors"
              style={{ color: accentColor }}
            >
              ← 返回公車
            </button>
            {readyCapsuleCount > 0 && (
              <button
                type="button"
                onClick={() => setCapsuleVisible(true)}
                className="w-full py-2.5 px-4 text-left text-sm font-normal transition-colors border-b border-white/10"
                style={{
                  color: accentColor,
                  backgroundColor: `${accentColor}15`,
                }}
              >
                ✨ 你有 {readyCapsuleCount} 個時光膠囊可以打開
              </button>
            )}
          </div>
        )}
        <header className="shrink-0 p-3 border-b border-white/10">
          <MoodRiver
            stones={stones}
            onAddStone={(id, color) => {
              if (showTutorial && tutorialStep === 4) setTutorialStep?.(5);
              addStone(id, color);
            }}
            accentColor={accentColor}
          />
        </header>
        {showTutorial && tutorialStep >= 3 && tutorialStep <= 9 && TUTORIAL_HINT[tutorialStep] && (
          <div
            className="shrink-0 py-2 px-4 border-b border-white/10 text-center text-sm"
            style={{ color: accentColor, backgroundColor: `${accentColor}12` }}
          >
            → {TUTORIAL_HINT[tutorialStep]}
          </div>
        )}

        {/* 主區：只有對話可捲動 */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="w-full max-w-lg flex-1 flex flex-col min-h-0 px-4 mx-auto relative pb-2">
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto space-y-3 py-2 pb-4 scroll-smooth"
              role="log"
              aria-label="與小曉的對話"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <span
                      className={`max-w-[85%] rounded-3xl px-4 py-2.5 text-sm font-normal leading-relaxed shadow-soft ${
                        msg.role === "user"
                          ? "bg-white/10 backdrop-blur-md border border-white/20 text-twilight-text"
                          : "glass-card text-twilight-text"
                      }`}
                    >
                      {msg.text}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatBottomRef} className="h-1 shrink-0" aria-hidden />
            </div>
            <AnimatePresence>
              {showScrollTop && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToTop}
                  aria-label="捲動到最上方"
                  className="absolute left-6 top-4 z-10 rounded-full bg-twilight-bg/90 backdrop-blur border p-2.5 shadow-soft min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation hover:opacity-90 transition-opacity"
                  style={{ borderColor: `${accentColor}66`, color: accentColor }}
                >
                  <span className="text-lg leading-none">↑</span>
                </motion.button>
              )}
            </AnimatePresence>
            {/* 小曉頭像（左下）+ 輸入列 */}
            <div className="flex gap-2 py-3 items-end flex-nowrap">
              <div className="shrink-0 self-center" aria-hidden>
                <XiaoXiaoOrb volumeLevel={volumeLevel} isSpeaking={isSpeaking} orbColor={orbColor} orbColorSecond={orbColorSecond} size="small" />
              </div>
              <div className="flex-1 flex gap-2 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="跟小曉說說話... (Enter 送出)"
                  aria-label="輸入訊息"
                  className="flex-1 rounded-3xl bg-white/10 backdrop-blur-md border px-4 py-3 min-h-[48px] text-twilight-text placeholder:text-twilight-muted font-normal min-w-0"
                  style={{
                    borderColor: "rgba(255,255,255,0.2)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${accentColor}60`;
                    e.currentTarget.style.borderColor = `${accentColor}66`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  }}
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  aria-label="送出訊息"
                  className="rounded-3xl border backdrop-blur-md px-4 py-3 min-h-[48px] font-medium shadow-soft touch-manipulation active:scale-[0.98] transition-transform shrink-0"
                  style={{
                    color: accentColor,
                    borderColor: `${accentColor}66`,
                    backgroundColor: `${accentColor}1a`,
                  }}
                >
                  送出
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* 底部：單行導航（不換行） */}
        <footer className="fixed bottom-0 left-0 right-0 z-10 flex flex-nowrap justify-center items-center gap-1.5 px-2 py-2 border-t border-white/10 bg-twilight-bg/95 backdrop-blur safe-area-pb overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              if (showTutorial && tutorialStep === 5) setTutorialStep?.(6);
              setBreatheVisible(true);
            }}
            aria-label="開啟呼吸練習"
            className="rounded-2xl px-3 py-2 min-h-[40px] text-xs font-normal border shrink-0 touch-manipulation active:scale-[0.98] transition-transform whitespace-nowrap"
            style={{ color: accentColor, borderColor: `${accentColor}66`, backgroundColor: `${accentColor}12` }}
          >
            呼吸
          </button>
          <button
            type="button"
            onClick={() => {
              if (showTutorial && tutorialStep === 6) setTutorialStep?.(7);
              setCapsuleVisible(true);
            }}
            aria-label="開啟時光膠囊"
            className="rounded-2xl px-3 py-2 min-h-[40px] text-xs font-normal border shrink-0 touch-manipulation active:scale-[0.98] whitespace-nowrap"
            style={{ color: accentColor, borderColor: `${accentColor}66`, backgroundColor: `${accentColor}12` }}
          >
            膠囊
          </button>
          <button
            type="button"
            onClick={() => {
              if (showTutorial && tutorialStep === 7) setTutorialStep?.(8);
              setMapVisible(true);
            }}
            aria-label="開啟資源地圖"
            className="rounded-2xl px-3 py-2 min-h-[40px] text-xs font-normal border shrink-0 touch-manipulation active:scale-[0.98] whitespace-nowrap"
            style={{ color: accentColor, borderColor: `${accentColor}66`, backgroundColor: `${accentColor}12` }}
          >
            地圖
          </button>
          <button
            type="button"
            onClick={() => {
              if (showTutorial && tutorialStep === 8) setTutorialStep?.(9);
              setStatsVisible(true);
            }}
            aria-label="我的紀錄"
            className="rounded-2xl px-3 py-2 min-h-[40px] text-xs font-normal border shrink-0 touch-manipulation active:scale-[0.98] whitespace-nowrap"
            style={{ color: accentColor, borderColor: `${accentColor}66`, backgroundColor: `${accentColor}12` }}
          >
            紀錄
          </button>
          <button
            type="button"
            onClick={() => {
              if (showTutorial && tutorialStep === 9) setTutorialStep?.(10);
              setSettingsVisible(true);
            }}
            aria-label="設定"
            className="rounded-2xl px-3 py-2 min-h-[40px] text-xs font-normal border shrink-0 touch-manipulation active:scale-[0.98] whitespace-nowrap"
            style={{ color: accentColor, borderColor: `${accentColor}66`, backgroundColor: `${accentColor}12` }}
          >
            設定
          </button>
        </footer>
        {/* Spacer so content isn't hidden behind fixed footer */}
        <div className="h-16 shrink-0" aria-hidden />
      </div>

      <BreatheMode
          visible={breatheVisible}
          onClose={() => setBreatheVisible(false)}
          onCycleComplete={incrementBreatheCount}
          orbColor={orbColor}
          orbColorSecond={orbColorSecond}
        />
      <TimeCapsule
          visible={capsuleVisible}
          onClose={() => setCapsuleVisible(false)}
          onCapsuleOpened={() => setReadyCapsuleCount(getReadyToOpenCount())}
        />
      <ResourceMap visible={mapVisible} onClose={() => setMapVisible(false)} />
      <StatsView stones={stones} visible={statsVisible} onClose={() => setStatsVisible(false)} />
      <SettingsView
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onSettingsChange={() => {
          const s = getSettings();
          setAccentColor(s.accentColor);
          setOrbColor(s.orbColor);
          setOrbColorSecond(s.orbColorSecond);
        }}
        onShowTutorialAgain={() => {
          clearTutorialDone();
          onRequestShowTutorial?.();
          setSettingsVisible(false);
        }}
        onClearAllData={() => {
          setStones([]);
          setMessages([]);
          setReadyCapsuleCount(0);
          const s = getSettings();
          setAccentColor(s.accentColor);
          setOrbColor(s.orbColor);
          setOrbColorSecond(s.orbColorSecond);
        }}
      />
      <SOSOverlay visible={sosVisible} onDismiss={() => setSosVisible(false)} />
      {showTutorial && tutorialStep === 10 && (
        <TutorialOverlay
          visible
          step={10}
          setStep={() => {}}
          onClose={onTutorialComplete ?? (() => {})}
          showWhenSteps={[10]}
          accentColor={accentColor}
        />
      )}
    </>
  );
}
