"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MOOD_COLORS } from "@/lib/constants";

const MOOD_OPTIONS = [
  { id: "calm", label: "平靜" },
  { id: "sad", label: "難過" },
  { id: "anxious", label: "焦慮" },
  { id: "angry", label: "生氣" },
  { id: "hopeful", label: "有希望" },
  { id: "tired", label: "累" },
  { id: "okay", label: "還好" },
  { id: "other", label: "其他" },
];

export interface MoodStone {
  id: string;
  moodId: string;
  color: string;
  createdAt: number;
}

interface MoodRiverProps {
  stones: MoodStone[];
  onAddStone: (moodId: string, color: string) => void;
}

export default function MoodRiver({ stones, onAddStone }: MoodRiverProps) {
  const [showPicker, setShowPicker] = useState(false);
  const riverRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-xs text-lo-fi-muted">心情點擊</span>
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="text-xs text-lo-fi-accent underline"
        >
          {showPicker ? "收合" : "記錄心情"}
        </button>
      </div>
      {showPicker && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 p-2"
        >
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                const color = MOOD_COLORS[m.id] || MOOD_COLORS.other;
                onAddStone(m.id, color);
                setShowPicker(false);
              }}
              className="px-3 py-1.5 rounded-full text-sm border border-lo-fi-muted"
              style={{ borderColor: MOOD_COLORS[m.id] || MOOD_COLORS.other }}
            >
              {m.label}
            </button>
          ))}
        </motion.div>
      )}
      <div
        ref={riverRef}
        className="relative h-14 overflow-hidden rounded-lg bg-lo-fi-river/80 border border-lo-fi-muted/50"
      >
        <div className="river-flow absolute inset-0 flex items-center gap-8">
          {[...stones, ...stones].map((s, i) => (
            <motion.span
              key={`${s.id}-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
