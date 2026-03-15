"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getSettings, saveSettings } from "@/lib/settingsStorage";
import { clearAllAppData } from "@/lib/clearAllData";

const PRESET_ACCENT = [
  { name: "琥珀", value: "#F2C94C" },
  { name: "淡紫", value: "#BB9AF7" },
  { name: "青綠", value: "#2AC3DE" },
  { name: "藍", value: "#7AA2F7" },
  { name: "粉", value: "#F5B0CB" },
  { name: "薄荷", value: "#98D8C8" },
];

interface SettingsViewProps {
  visible: boolean;
  onClose: () => void;
  onSettingsChange?: () => void;
  onShowTutorialAgain?: () => void;
  onClearAllData?: () => void;
}

export default function SettingsView({ visible, onClose, onSettingsChange, onShowTutorialAgain, onClearAllData }: SettingsViewProps) {
  const [unlockCode, setUnlockCode] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [orbColor, setOrbColor] = useState("");
  const [orbColorSecond, setOrbColorSecond] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (visible) {
      const s = getSettings();
      setUnlockCode(s.unlockCode);
      setAccentColor(s.accentColor);
      setOrbColor(s.orbColor);
      setOrbColorSecond(s.orbColorSecond);
    }
  }, [visible]);

  const handleSave = () => {
    const code = unlockCode.trim() || "110#";
    saveSettings({
      unlockCode: code,
      accentColor: accentColor || "#F2C94C",
      orbColor: orbColor || "#F2C94C",
      orbColorSecond: orbColorSecond || "#BB9AF7",
    });
    onSettingsChange?.();
    onClose();
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-twilight-bg overflow-y-auto"
    >
      <div className="max-w-lg mx-auto p-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-twilight-amber font-semibold">設定</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-3xl px-4 py-2 text-twilight-text border border-white/20 bg-white/10 hover:bg-white/20 text-sm"
          >
            關閉
          </button>
        </div>

        <section className="glass-card p-4 mb-4">
          <h3 className="text-twilight-text font-medium mb-2">進入密碼</h3>
          <p className="text-xs text-twilight-muted mb-2">
            在計算機畫面輸入此密碼可進入小曉介面（僅限數字與 #）
          </p>
          <input
            type="text"
            value={unlockCode}
            onChange={(e) => setUnlockCode(e.target.value.replace(/[^0-9#]/g, ""))}
            placeholder="110#"
            className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-2.5 text-twilight-text placeholder:text-twilight-muted focus:outline-none focus:ring-2 focus:ring-twilight-amber/50"
          />
        </section>

        <section className="glass-card p-4 mb-4">
          <h3 className="text-twilight-text font-medium mb-2">介面主色</h3>
          <p className="text-xs text-twilight-muted mb-2">按鈕、重點文字等</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_ACCENT.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setAccentColor(p.value)}
                className="w-10 h-10 rounded-full border-2 border-white/30 transition-transform hover:scale-110"
                style={{ backgroundColor: p.value }}
                title={p.name}
              />
            ))}
          </div>
          <input
            type="text"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            placeholder="#F2C94C"
            className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-2 text-twilight-text text-sm"
          />
        </section>

        <section className="glass-card p-4 mb-4">
          <h3 className="text-twilight-text font-medium mb-2">小曉光球顏色（漸層）</h3>
          <p className="text-xs text-twilight-muted mb-2">第一色與第二色組成漸層，發光圓球與呼吸練習圓球</p>
          <p className="text-xs text-twilight-muted mb-1">第一色</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_ACCENT.map((p) => (
              <button
                key={"orb1-" + p.value}
                type="button"
                onClick={() => setOrbColor(p.value)}
                className="w-10 h-10 rounded-full border-2 border-white/30 transition-transform hover:scale-110"
                style={{ backgroundColor: p.value }}
                title={p.name}
              />
            ))}
          </div>
          <input
            type="text"
            value={orbColor}
            onChange={(e) => setOrbColor(e.target.value)}
            placeholder="#F2C94C"
            className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-2 text-twilight-text text-sm mb-3"
          />
          <p className="text-xs text-twilight-muted mb-1">第二色</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_ACCENT.map((p) => (
              <button
                key={"orb2-" + p.value}
                type="button"
                onClick={() => setOrbColorSecond(p.value)}
                className="w-10 h-10 rounded-full border-2 border-white/30 transition-transform hover:scale-110"
                style={{ backgroundColor: p.value }}
                title={p.name}
              />
            ))}
          </div>
          <input
            type="text"
            value={orbColorSecond}
            onChange={(e) => setOrbColorSecond(e.target.value)}
            placeholder="#BB9AF7"
            className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-2 text-twilight-text text-sm"
          />
        </section>

        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3 rounded-3xl glass-card text-twilight-text font-medium mb-4"
        >
          儲存設定
        </button>

        <section className="glass-card p-4 mb-4">
          <h3 className="text-twilight-text font-medium mb-2">使用教學</h3>
          <p className="text-xs text-twilight-muted mb-2">
            點擊後會立即回到公車畫面並顯示教學，無需重新整理。
          </p>
          <button
            type="button"
            onClick={() => {
              onShowTutorialAgain?.();
            }}
            className="rounded-2xl px-4 py-2 text-sm text-twilight-text border border-white/20 bg-white/10 hover:bg-white/20"
          >
            重新顯示使用教學
          </button>
        </section>

        <section className="glass-card p-4 mb-4">
          <h3 className="text-twilight-text font-medium mb-2">清除所有資料</h3>
          <p className="text-xs text-twilight-muted mb-2">
            刪除心情石頭、時光膠囊、呼吸紀錄、設定與教學狀態，無法復原。
          </p>
          {!showClearConfirm ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="rounded-2xl px-4 py-2 text-sm text-twilight-text border border-white/20 bg-white/10 hover:bg-white/20"
            >
              清除所有資料
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  clearAllAppData();
                  onClearAllData?.();
                  setShowClearConfirm(false);
                  onClose();
                }}
                className="rounded-2xl px-4 py-2 text-sm border bg-red-500/20 text-red-300 border-red-400/40"
              >
                確定清除
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-2xl px-4 py-2 text-sm text-twilight-text border border-white/20 bg-white/10"
              >
                取消
              </button>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
