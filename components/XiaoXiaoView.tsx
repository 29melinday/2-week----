"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import XiaoXiaoOrb from "./XiaoXiaoOrb";
import MoodRiver, { MoodStone } from "./MoodRiver";
import SOSOverlay from "./SOSOverlay";
import BreatheMode from "./BreatheMode";
import TimeCapsule from "./TimeCapsule";
import ResourceMap from "./ResourceMap";
import { checkSOS } from "@/lib/sos";
import { STRESS_KEYWORDS } from "@/lib/constants";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export default function XiaoXiaoView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [stones, setStones] = useState<MoodStone[]>([]);
  const [sosVisible, setSosVisible] = useState(false);
  const [breatheVisible, setBreatheVisible] = useState(false);
  const [capsuleVisible, setCapsuleVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkAndTriggerSOS = useCallback((text: string) => {
    if (checkSOS(text)) setSosVisible(true);
  }, []);

  const checkStress = useCallback((text: string) => {
    if (STRESS_KEYWORDS.some((k) => text.includes(k))) setBreatheVisible(true);
  }, []);

  const addStone = useCallback((moodId: string, color: string) => {
    setStones((s) => [
      ...s,
      { id: `stone-${Date.now()}`, moodId, color, createdAt: Date.now() },
    ]);
  }, []);

  const sendMessage = useCallback(async () => {
    const t = input.trim();
    if (!t) return;
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
  }, [input, messages, checkAndTriggerSOS, checkStress]);

  return (
    <>
      <div className="min-h-screen bg-lo-fi-bg flex flex-col">
        {/* 頂部：情緒河流 */}
        <header className="shrink-0 p-2 border-b border-lo-fi-muted/50">
          <MoodRiver stones={stones} onAddStone={addStone} />
        </header>

        {/* 主區：發光圓球 + 對話 */}
        <main className="flex-1 flex flex-col items-center overflow-hidden">
          <div className="flex-shrink-0 py-6">
            <XiaoXiaoOrb volumeLevel={volumeLevel} isSpeaking={isSpeaking} />
          </div>
          <div className="w-full max-w-lg flex-1 flex flex-col min-h-0 px-4">
            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <span
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-lo-fi-accent/30 text-lo-fi-warm"
                          : "bg-lo-fi-card border border-lo-fi-muted text-lo-fi-warm/95"
                      }`}
                    >
                      {msg.text}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex gap-2 py-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="跟小曉說說話..."
                className="flex-1 rounded-xl bg-lo-fi-card border border-lo-fi-muted px-4 py-3 text-lo-fi-warm placeholder:text-lo-fi-muted focus:outline-none focus:ring-2 focus:ring-lo-fi-accent/50"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="rounded-xl bg-lo-fi-accent/50 hover:bg-lo-fi-accent/70 px-4 py-3 text-lo-fi-warm font-medium"
              >
                送出
              </button>
            </div>
          </div>
        </main>

        {/* 底部：工具入口 */}
        <footer className="shrink-0 flex justify-center gap-4 p-4 border-t border-lo-fi-muted/50">
          <button
            type="button"
            onClick={() => setBreatheVisible(true)}
            className="text-sm text-lo-fi-muted hover:text-lo-fi-accent"
          >
            呼吸練習
          </button>
          <button
            type="button"
            onClick={() => setCapsuleVisible(true)}
            className="text-sm text-lo-fi-muted hover:text-lo-fi-accent"
          >
            時光膠囊
          </button>
          <button
            type="button"
            onClick={() => setMapVisible(true)}
            className="text-sm text-lo-fi-muted hover:text-lo-fi-accent"
          >
            資源地圖
          </button>
        </footer>
      </div>

      <BreatheMode visible={breatheVisible} onClose={() => setBreatheVisible(false)} />
      <TimeCapsule visible={capsuleVisible} onClose={() => setCapsuleVisible(false)} />
      <ResourceMap visible={mapVisible} onClose={() => setMapVisible(false)} />
      <SOSOverlay visible={sosVisible} onDismiss={() => setSosVisible(false)} />
    </>
  );
}
