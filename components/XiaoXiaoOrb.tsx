"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface XiaoXiaoOrbProps {
  /** 0–1 音量等級，用於縮放 */
  volumeLevel?: number;
  /** 是否正在說話（呼吸感） */
  isSpeaking?: boolean;
}

export default function XiaoXiaoOrb({ volumeLevel = 0, isSpeaking = false }: XiaoXiaoOrbProps) {
  const [scale, setScale] = useState(1);
  const raf = useRef<number>(0);

  useEffect(() => {
    const base = 1 + (volumeLevel * 0.4);
    setScale(base);
  }, [volumeLevel]);

  return (
    <motion.div
      className="relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64"
      animate={{ scale: isSpeaking ? scale : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-lo-fi-accent/60 to-lo-fi-accent/20 orb-glow"
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 20px 8px rgba(201, 168, 108, 0.35)",
            "0 0 40px 18px rgba(201, 168, 108, 0.45)",
            "0 0 20px 8px rgba(201, 168, 108, 0.35)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative w-3/4 h-3/4 rounded-full bg-gradient-to-br from-lo-fi-warm/30 to-lo-fi-accent/40 backdrop-blur-sm" />
    </motion.div>
  );
}
