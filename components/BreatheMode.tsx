"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreatheModeProps {
  visible: boolean;
  onClose: () => void;
}

const PHASES = [
  { label: "吸氣", duration: 4, scale: 1.2 },
  { label: "屏息", duration: 7, scale: 1.2 },
  { label: "吐氣", duration: 8, scale: 0.85 },
];

export default function BreatheMode({ visible, onClose }: BreatheModeProps) {
  const [phase, setPhase] = useState(0);
  const [key, setKey] = useState(0);

  if (!visible) return null;

  const current = PHASES[phase];
  const prevScale = phase === 0 ? 0.85 : 1.2;

  return (
    <AnimatePresence>
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
        <p className="text-lo-fi-accent text-lg mb-8">4-7-8 呼吸法</p>
        <motion.div
          key={key}
          initial={{ scale: prevScale }}
          className="w-32 h-32 rounded-full bg-lo-fi-accent/30 border-2 border-lo-fi-accent/60 flex items-center justify-center"
          animate={{ scale: current.scale }}
          transition={{
            duration: current.duration,
            ease: "easeInOut",
            onComplete: () => {
              setPhase((p) => (p + 1) % PHASES.length);
              setKey((k) => k + 1);
            },
          }}
        >
          <span className="text-lo-fi-warm text-xl">{current.label}</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
