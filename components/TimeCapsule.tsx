"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface TimeCapsuleProps {
  visible: boolean;
  onClose: () => void;
}

export default function TimeCapsule({ visible, onClose }: TimeCapsuleProps) {
  const [content, setContent] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!content.trim()) return;
    // 可存 localStorage 或後端，30 天後顯示
    const key = `capsule-${Date.now()}`;
    const unlockAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    try {
      localStorage.setItem(key, JSON.stringify({ content: content.trim(), unlockAt }));
    } catch (_) {}
    setSent(true);
    setTimeout(() => {
      setContent("");
      setSent(false);
      onClose();
    }, 2000);
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-lo-fi-bg flex flex-col items-center justify-center p-6"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-lo-fi-muted text-sm"
      >
        關閉
      </button>
      <div className="w-full max-w-sm">
        <h2 className="text-lg text-lo-fi-accent mb-2">時光膠囊</h2>
        <p className="text-sm text-lo-fi-muted mb-4">寫給 30 天後的自己</p>
        {/* 3D 瓶子感：用圓角長方 + 漸層 */}
        <div className="rounded-t-full rounded-b-3xl bg-gradient-to-b from-lo-fi-accent/20 to-lo-fi-card border-2 border-lo-fi-accent/40 p-6 min-h-[200px]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="未來的你，你好..."
            className="w-full h-32 bg-transparent text-lo-fi-warm placeholder:text-lo-fi-muted resize-none focus:outline-none"
            disabled={sent}
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={sent}
          className="mt-4 w-full py-3 rounded-xl bg-lo-fi-accent/50 text-lo-fi-warm font-medium disabled:opacity-50"
        >
          {sent ? "已封存，30 天後見" : "封存膠囊"}
        </button>
      </div>
    </motion.div>
  );
}
