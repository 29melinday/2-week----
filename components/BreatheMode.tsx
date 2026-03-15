"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreatheModeProps {
  visible: boolean;
  onClose: () => void;
  onCycleComplete?: () => void;
  orbColor?: string;
  orbColorSecond?: string;
}

const PHASES = [
  { label: "吸氣", duration: 4, scale: 1.2, ease: "easeInOut" as const },
  { label: "屏息", duration: 7, scale: 1.2, ease: "linear" as const },
  { label: "吐氣", duration: 8, scale: 0.85, ease: "easeInOut" as const },
];

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "242, 201, 76";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export default function BreatheMode({
  visible,
  onClose,
  onCycleComplete,
  orbColor = "#F2C94C",
  orbColorSecond = "#BB9AF7",
}: BreatheModeProps) {
  const [phase, setPhase] = useState(0);
  const [key, setKey] = useState(0);
  const rgb = hexToRgb(orbColor);

  if (!visible) return null;

  const current = PHASES[phase];
  const prevScale = phase === 0 ? 0.85 : 1.2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-twilight-bg flex flex-col items-center justify-center p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-3xl px-4 py-2 text-twilight-text border border-white/20 bg-white/10 hover:bg-white/20 text-sm font-normal transition-colors"
        >
          關閉
        </button>
        <p className="text-lg mb-8 font-semibold" style={{ color: orbColor }}>
          4-7-8 呼吸法
        </p>

        <motion.div
          key={key}
          initial={{ scale: prevScale }}
          className="relative flex items-center justify-center w-48 h-48"
          animate={{ scale: current.scale }}
          transition={{
            duration: current.duration,
            ease: current.ease,
            onComplete: () => {
              const next = (phase + 1) % PHASES.length;
              setPhase(next);
              setKey((k) => k + 1);
              if (next === 0) onCycleComplete?.();
            },
          }}
        >
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 rounded-full backdrop-blur-sm border border-white/10"
            style={{
              background: `linear-gradient(to bottom right, ${orbColor}60, ${orbColorSecond}20)`,
              boxShadow: `0 0 50px 20px rgba(${rgb}, 0.3), 0 0 80px 30px rgba(${rgb}, 0.2)`,
            }}
            animate={{
              boxShadow: [
                `0 0 40px 15px rgba(${rgb}, 0.25)`,
                `0 0 60px 25px rgba(${rgb}, 0.4)`,
                `0 0 40px 15px rgba(${rgb}, 0.25)`,
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Inner orb with label inside */}
          <div
            className="relative w-3/4 h-3/4 rounded-full border border-white/10 flex items-center justify-center"
            style={{
              background: `linear-gradient(to bottom right, ${orbColor}50, ${orbColorSecond}15)`,
            }}
          >
            <span className="relative z-10 text-twilight-text text-xl font-normal">
              {current.label}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
