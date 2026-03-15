"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MOOD_COLORS } from "@/lib/constants";
import {getSettings} from "@/lib/settingsStorage";

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

const ROCK_SIZES = [
  "w-6 h-5", "w-7 h-5", "w-5 h-6", "w-6 h-6", "w-5 h-5",
  "w-7 h-4", "w-4 h-6", "w-6 h-4", "w-5 h-5", "w-4 h-5",
];
const ROCK_SHAPES = [
  "45% 55% 60% 40% / 55% 45% 55% 45%",
  "60% 40% 45% 55% / 40% 60% 50% 50%",
  "50% 50% 40% 60% / 60% 40% 50% 50%",
  "40% 60% 55% 45% / 55% 50% 45% 50%",
  "55% 45% 50% 50% / 45% 55% 60% 40%",
  "35% 65% 55% 45% / 60% 35% 45% 55%",
  "50% 50% 55% 45% / 45% 55% 50% 50%",
  "60% 40% 50% 50% / 50% 50% 40% 60%",
];

function getRockStyle(index: number) {
  return {
    size: ROCK_SIZES[index % ROCK_SIZES.length],
    shape: ROCK_SHAPES[index % ROCK_SHAPES.length],
  };
}

// Deterministic scatter: same index => same position
function scatterPosition(index: number): { left: number; top: number } {
  const left = ((index * 37) % 97) + 1;
  const top = 12 + ((index * 23 + index * 7) % 72);
  return { left, top };
}

// One segment of pebbles with scattered positions; we'll render this twice for seamless loop
function buildSegment(
  stones: MoodStone[],
  copiesPerSegment: number
): { stone: MoodStone; left: number; top: number; size: string; shape: string; globalIndex: number }[] {
  if (stones.length === 0) return [];
  const out: { stone: MoodStone; left: number; top: number; size: string; shape: string; globalIndex: number }[] = [];
  let globalIndex = 0;
  for (let c = 0; c < copiesPerSegment; c++) {
    stones.forEach((s) => {
      const { left, top } = scatterPosition(globalIndex);
      const { size, shape } = getRockStyle(globalIndex);
      out.push({
        stone: { ...s, id: `${s.id}-seg-${c}` },
        left,
        top,
        size,
        shape,
        globalIndex,
      });
      globalIndex++;
    });
  }
  return out;
}

export default function MoodRiver({ stones, onAddStone }: MoodRiverProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [justDropped, setJustDropped] = useState(false);

  const handlePick = (moodId: string, color: string) => {
    onAddStone(moodId, color);
    setShowPicker(false);
    setJustDropped(true);
    setTimeout(() => setJustDropped(false), 700);
  };

  const segment = useMemo(
    () => buildSegment(stones, stones.length > 0 ? 8 : 0),
    [stones]
  );
  const lastId = stones.length > 0 ? stones[stones.length - 1].id : "";
  const [accentColor, setAccentColor] = useState(getSettings().accentColor);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-xs text-twilight-muted font-light">心情點擊</span>
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          aria-label={showPicker ? "收合心情選單" : "記錄心情"}
          className="rounded-3xl px-4 py-2 text-sm text-twilight-amber font-normal border border-white/20 bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all min-h-[44px] touch-manipulation"
          style={{
            color: accentColor,
            borderColor: `${accentColor}66`,
            backgroundColor: `${accentColor}1a`,
          }}
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
              onClick={() => handlePick(m.id, MOOD_COLORS[m.id] || MOOD_COLORS.other)}
              aria-label={`心情：${m.label}`}
              className="min-h-[44px] min-w-[72px] px-4 py-2.5 rounded-3xl text-sm font-normal border border-white/20 bg-white/10 backdrop-blur-md touch-manipulation active:scale-[0.98] transition-transform"
              style={{ borderColor: MOOD_COLORS[m.id] || MOOD_COLORS.other }}
            >
              {m.label}
            </button>
          ))}
        </motion.div>
      )}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[160px] overflow-hidden bg-gradient-to-r from-twilight-riverStart/50 to-twilight-riverEnd/50 border-y border-white/20">
        {/* Flow lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="absolute h-px bg-white/20 river-flow-line"
              style={{
                top: `${10 + i * 11}%`,
                left: "-10%",
                width: "45%",
                animationDelay: `${i * 0.35}s`,
              }}
            />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`b-${i}`}
              className="absolute h-px bg-twilight-riverStart/30 river-flow-line-slow"
              style={{
                top: `${18 + i * 16}%`,
                left: "-15%",
                width: "40%",
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 opacity-40">
          <svg className="absolute bottom-0 w-[200%] h-full animate-river-wave-move" viewBox="0 0 400 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2AC3DE" />
                <stop offset="100%" stopColor="#7AA2F7" />
              </linearGradient>
            </defs>
            <path fill="url(#riverGrad)" d="M0,25 C50,15 100,35 150,25 T200,25 T250,25 T300,25 T350,25 T400,25 L400,40 L0,40 Z" />
            <path fill="url(#riverGrad)" opacity="0.7" d="M0,28 C40,18 80,32 120,28 T200,28 T280,28 T360,28 L400,28 L400,40 L0,40 Z" />
          </svg>
        </div>
        {segment.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-twilight-muted/70 text-sm font-normal px-4">
              點上方「記錄心情」，讓石頭流入河裡
            </p>
          </div>
        )}
        {/* Two identical segments so when we translate -50% the trail has no visible end */}
        <div className="river-flow-seamless absolute inset-0 overflow-hidden">
          <div className="absolute top-0 bottom-0 flex" style={{ width: "200%" }}>
            {[0, 1].map((segmentCopy) => (
              <div
                key={segmentCopy}
                className="relative shrink-0 h-full"
                style={{ width: "50%" }}
              >
                {segment.map(({ stone: s, left, top, size, shape, globalIndex }) => {
                  const isNewDrop = justDropped && lastId && s.id.startsWith(`${lastId}-seg-0`);
                  const delay = (globalIndex % 5) * 0.25;
                  return (
                    <motion.span
                      key={`${s.id}-${segmentCopy}`}
                      initial={isNewDrop ? { scale: 0, opacity: 0 } : false}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        y: [0, -4, 0],
                      }}
                      transition={{
                        scale: { type: "spring", stiffness: 400, damping: 25 },
                        y: {
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          repeatType: "reverse",
                          delay,
                        },
                      }}
                      className={`stone-bob absolute ${size} border border-white/25 block`}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        transform: "translate(-50%, -50%)",
                        borderRadius: shape,
                        backgroundColor: s.color,
                        boxShadow: `0 3px 10px ${s.color}50, inset 1px 1px 0 rgba(255,255,255,0.25), inset -1px -1px 0 rgba(0,0,0,0.1)`,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {justDropped && (
          <motion.span
            className="absolute inset-0 border-2 border-white/30 pointer-events-none"
            initial={{ scale: 0.3, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
