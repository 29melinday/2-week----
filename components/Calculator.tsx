"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KEY_ROWS: (string | [string, number])[][] = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  [["0", 2], ".", "="],
];

interface CalculatorProps {
  visible: boolean;
  onUnlock: () => void;
  onClose?: () => void;
}

export default function Calculator({ visible, onUnlock, onClose }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [buffer, setBuffer] = useState("");
  const [entered, setEntered] = useState("");

  const append = useCallback((char: string) => {
    if (char === "C") {
      setDisplay("0");
      setBuffer("");
      setEntered("");
      return;
    }
    if (char === "=") return;
    const next = (display === "0" && char !== "." ? char : display + char);
    setDisplay(next.slice(-20));
    setBuffer((b) => (b + char).slice(-10));
  }, [display]);

  useEffect(() => {
    if (buffer.endsWith("110#")) {
      setBuffer("");
      onUnlock();
    }
  }, [buffer, onUnlock]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-lo-fi-bg flex flex-col justify-end"
      >
        <div className="p-4 text-right">
          <div className="text-4xl font-mono text-lo-fi-warm min-h-[48px] truncate">
            {display}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 p-4 pb-8">
          {KEY_ROWS.flat().map((cell, idx) => {
            const [key, span] = Array.isArray(cell) ? [cell[0], cell[1]] : [cell as string, 1];
            return (
              <motion.button
                key={`${key}-${idx}`}
                whileTap={{ scale: 0.95 }}
                className={`h-14 rounded-xl bg-lo-fi-card border border-lo-fi-muted text-lo-fi-warm text-xl font-medium
                  ${span === 2 ? "col-span-2" : ""}`}
                onClick={() => append(key)}
              >
                {key}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
