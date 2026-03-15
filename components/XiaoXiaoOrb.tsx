"use client";

import { useState } from "react";
import { motion } from "framer-motion";

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "242, 201, 76";
}

interface XiaoXiaoOrbProps {
  volumeLevel?: number;
  isSpeaking?: boolean;
  orbColor?: string;
  orbColorSecond?: string;
}

export default function XiaoXiaoOrb({
  volumeLevel = 0,
  isSpeaking = false,
  orbColor = "#F2C94C",
  orbColorSecond = "#BB9AF7",
}: XiaoXiaoOrbProps) {
  const scale = 1 + (isSpeaking ? 0.08 + volumeLevel * 0.12 : 0);
  const rgb = hexToRgb(orbColor);

  return (
    <motion.div
      className="relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64"
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full backdrop-blur-sm"
        style={{
          background: `linear-gradient(to bottom right, ${orbColor}b3, ${orbColorSecond}80)`,
        }}
        animate={{
          scale: isSpeaking ? [1, scale, 1] : [1, 1.05, 1],
          boxShadow: isSpeaking
            ? [
                `0 0 50px 20px rgba(${rgb}, 0.35)`,
                `0 0 70px 28px rgba(${rgb}, 0.5)`,
                `0 0 50px 20px rgba(${rgb}, 0.35)`,
              ]
            : [
                `0 0 40px 14px rgba(${rgb}, 0.25)`,
                `0 0 55px 20px rgba(${rgb}, 0.35)`,
                `0 0 40px 14px rgba(${rgb}, 0.25)`,
              ],
        }}
        transition={{
          duration: isSpeaking ? 0.8 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div
        className="relative w-3/4 h-3/4 rounded-full backdrop-blur-sm border border-white/10"
        style={{
          background: `linear-gradient(to bottom right, ${orbColor}66, ${orbColorSecond}4d)`,
        }}
      />
    </motion.div>
  );
}
