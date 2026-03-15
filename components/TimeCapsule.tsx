"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCapsuleList,
  saveCapsuleList,
  getCapsuleContent,
  markCapsuleOpened,
  type CapsuleEntry,
} from "@/lib/capsuleStorage";

interface TimeCapsuleProps {
  visible: boolean;
  onClose: () => void;
  onCapsuleOpened?: () => void;
}

type View = "main" | "write" | "open" | "past";

function getDaysLeft(unlockAt: number): number {
  const now = Date.now();
  if (unlockAt <= now) return 0;
  return Math.ceil((unlockAt - now) / (24 * 60 * 60 * 1000));
}

export default function TimeCapsule({ visible, onClose, onCapsuleOpened }: TimeCapsuleProps) {
  const [content, setContent] = useState("");
  const [sent, setSent] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [view, setView] = useState<View>("main");
  const [list, setList] = useState<CapsuleEntry[]>([]);
  const [openingKey, setOpeningKey] = useState<string | null>(null);
  const [viewingSealed, setViewingSealed] = useState(false);
  const [pastExpanded, setPastExpanded] = useState(false);

  const now = Date.now();
  const ready = list.filter((e) => !e.opened && e.unlockAt <= now);
  const past = list.filter((e) => e.opened);
  const sealed = list.filter((e) => !e.opened && e.unlockAt > now);
  const allCapsules = [...list].sort((a, b) => (b.unlockAt ?? b.createdAt ?? 0) - (a.unlockAt ?? a.createdAt ?? 0));

  useEffect(() => {
    if (visible) {
      setList(getCapsuleList());
      setView("main");
      setOpeningKey(null);
      setViewingSealed(false);
    }
  }, [visible]);

  const handleSend = () => {
    if (!content.trim()) return;
    setSealing(true);
    const key = `capsule-${Date.now()}`;
    const unlockAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const entry = { content: content.trim(), unlockAt };
    try {
      localStorage.setItem(key, JSON.stringify(entry));
      const nextList = [
        ...getCapsuleList(),
        { key, unlockAt, opened: false, createdAt: Date.now() },
      ];
      saveCapsuleList(nextList);
      setList(nextList);
    } catch (_) {}
    setTimeout(() => {
      setSealing(false);
      setSent(true);
      setContent("");
      setTimeout(() => {
        setSent(false);
        setView("main");
        onClose();
      }, 2000);
    }, 2200);
  };

  const handleOpen = (key: string) => {
    const data = getCapsuleContent(key);
    if (!data) return;
    setOpeningKey(key);
    setViewingSealed(false);
    markCapsuleOpened(key, data.content);
    onCapsuleOpened?.();
    setList(getCapsuleList());
  };

  const handleCapsuleClick = (e: CapsuleEntry) => {
    const daysLeft = getDaysLeft(e.unlockAt);
    const isUnlocked = daysLeft <= 0 || e.opened;
    if (isUnlocked) {
      const data = getCapsuleContent(e.key);
      if (data) {
        setOpeningKey(e.key);
        setViewingSealed(false);
        if (!e.opened) {
          markCapsuleOpened(e.key, data.content);
          onCapsuleOpened?.();
          setList(getCapsuleList());
        }
      }
    } else {
      setOpeningKey(e.key);
      setViewingSealed(true);
    }
  };

  const closeOpenView = () => {
    setOpeningKey(null);
    setViewingSealed(false);
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-twilight-bg flex flex-col items-center justify-center p-6 overflow-y-auto"
    >
      <button
        type="button"
        onClick={() => { setView("main"); setOpeningKey(null); setViewingSealed(false); onClose(); }}
        className="absolute top-4 right-4 rounded-3xl px-4 py-2 text-twilight-text border border-white/20 bg-white/10 hover:bg-white/20 text-sm font-normal transition-colors"
      >
        關閉
      </button>

      <div className="w-full max-w-sm mt-8">
        <h2 className="text-lg text-twilight-amber mb-2 font-semibold">時光膠囊</h2>

        <AnimatePresence mode="wait">
          {openingKey ? (
            <motion.div
              key="opened"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-4 mb-4"
            >
              {viewingSealed ? (
                <>
                  <div className="flex flex-col items-center justify-center py-6">
                    <span className="text-5xl mb-3" aria-hidden>🔒</span>
                    <p className="text-twilight-muted text-sm mb-1">封存中</p>
                    <p className="text-twilight-amber text-xl font-medium">
                      {getDaysLeft(list.find((x) => x.key === openingKey)?.unlockAt ?? 0)} 天後可開啟
                    </p>
                    <p className="text-twilight-muted text-xs mt-2">
                      解鎖日：{new Date(list.find((x) => x.key === openingKey)?.unlockAt ?? 0).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeOpenView}
                    className="mt-3 w-full rounded-3xl px-4 py-2 text-sm border border-white/20 bg-white/10 hover:bg-white/20"
                  >
                    返回
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-twilight-muted mb-2">來自過去的你：</p>
                  <p className="text-twilight-text leading-relaxed whitespace-pre-wrap">
                    {list.find((x) => x.key === openingKey)?.content ??
                      getCapsuleContent(openingKey)?.content ??
                      ""}
                  </p>
                  <button
                    type="button"
                    onClick={closeOpenView}
                    className="mt-3 rounded-3xl px-4 py-2 text-sm border border-white/20 bg-white/10 hover:bg-white/20"
                  >
                    收起
                  </button>
                </>
              )}
            </motion.div>
          ) : view === "write" ? (
            <motion.div
              key="write"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <p className="text-sm text-twilight-muted font-normal">寫給 30 天後的自己</p>
              <div className=" rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 min-h-[200px] shadow-soft">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="未來的你，你好..."
                  className="w-full h-32 bg-transparent text-twilight-text placeholder:text-twilight-muted resize-none focus:outline-none font-normal leading-relaxed"
                  disabled={sent || sealing}
                />
              </div>
              {sealing ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl glass-card p-6 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.6, repeat: 2 }}
                    className="text-4xl mb-2"
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    className="w-16 h-16 rounded-full border-2 border-twilight-amber/60 bg-twilight-amber/20"
                    animate={{ scale: [1, 1.1, 0.95], opacity: [0.8, 1, 0.9] }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                  <p className="text-twilight-amber text-sm mt-2">封存中...</p>
                </motion.div>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sent || !content.trim()}
                  className="w-full py-3 rounded-3xl glass-card text-twilight-text font-medium disabled:opacity-50"
                >
                  {sent ? "已封存，30 天後見" : "封存膠囊"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setView("main")}
                className="text-sm text-twilight-muted"
              >
                ← 返回
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {ready.length > 0 && (
                <div className="rounded-3xl border border-twilight-amber/40 bg-twilight-amber/10 p-4">
                  <p className="text-twilight-amber font-medium mb-2">
                    你有 {ready.length} 個膠囊可以打開
                  </p>
                  {ready.map((e) => (
                    <button
                      key={e.key}
                      type="button"
                      onClick={() => handleOpen(e.key)}
                      className="w-full mt-2 py-2.5 rounded-2xl bg-twilight-amber/20 hover:bg-twilight-amber/30 text-twilight-text text-sm font-normal transition-colors"
                    >
                      打開膠囊
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setPastExpanded(!pastExpanded)}
                className="w-full py-2.5 rounded-3xl border border-white/20 bg-white/10 hover:bg-white/20 text-sm text-twilight-text font-normal transition-colors"
              >
                {pastExpanded ? "收合膠囊列表" : "查看所有膠囊"}
              </button>
              {pastExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  {allCapsules.length === 0 ? (
                    <p className="text-sm text-twilight-muted py-2">尚無膠囊</p>
                  ) : (
                    allCapsules.map((e) => {
                      const daysLeft = getDaysLeft(e.unlockAt);
                      const isSealed = daysLeft > 0 && !e.opened;
                      const unlockDateStr = e.unlockAt
                        ? new Date(e.unlockAt).toLocaleDateString("zh-TW", { year: "numeric", month: "short", day: "numeric" })
                        : "";
                      return (
                        <button
                          key={e.key}
                          type="button"
                          onClick={() => handleCapsuleClick(e)}
                          className="w-full text-left glass-card p-3 hover:bg-white/15 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-twilight-muted">
                              解鎖日 {unlockDateStr}
                            </span>
                            <span
                              className={`text-xs shrink-0 px-2 py-0.5 rounded-full ${
                                isSealed
                                  ? "bg-twilight-muted/30 text-twilight-muted"
                                  : "bg-twilight-amber/20 text-twilight-amber"
                              }`}
                            >
                              {isSealed ? "封存中" : "已開啟"}
                            </span>
                          </div>
                          {!isSealed && e.content && (
                            <p className="text-twilight-text text-sm leading-relaxed line-clamp-2 mt-1">
                              {e.content}
                            </p>
                          )}
                          {isSealed && (
                            <p className="text-twilight-muted text-xs mt-1">
                              {daysLeft} 天後可開啟
                            </p>
                          )}
                        </button>
                      );
                    })
                  )}
                </motion.div>
              )}

              <button
                type="button"
                onClick={() => setView("write")}
                className="w-full py-3 rounded-3xl glass-card text-twilight-text font-medium"
              >
                寫一個新膠囊
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
