"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSettings } from "@/lib/settingsStorage";

const KEY_ROWS: (string | [string, number])[][] = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["#", "0", ".", "="],
];

const OPS = ["÷", "×", "−", "+"] as const;

function compute(a: number, op: string, b: number): number {
  let result: number;
  switch (op) {
    case "+": result = a + b; break;
    case "−": result = a - b; break;
    case "×": result = a * b; break;
    case "÷": result = b === 0 ? 0 : a / b; break;
    default: result = b;
  }
  return Number.isInteger(result) ? result : Math.round(result * 1e10) / 1e10;
}

interface CalculatorProps {
  visible: boolean;
  onUnlock: () => void;
  onClose?: () => void;
  unlockCode?: string;
}

const DEFAULT_UNLOCK = "110#";

export default function Calculator({ visible, onUnlock, onClose, unlockCode: unlockCodeProp }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [buffer, setBuffer] = useState("");
  const [replaceNext, setReplaceNext] = useState(false);
  const [unlockCode, setUnlockCode] = useState(unlockCodeProp || DEFAULT_UNLOCK);

  useEffect(() => {
    if (visible) setUnlockCode(getSettings().unlockCode || unlockCodeProp || DEFAULT_UNLOCK);
  }, [visible, unlockCodeProp]);

  const codeChars = useMemo(
    () => new Set([..."0123456789#"].filter((c) => unlockCode.includes(c))),
    [unlockCode]
  );

  const handleKey = useCallback((char: string) => {
    if (codeChars.has(char)) {
      setBuffer((b) => {
        const next = (b + char).slice(-Math.max(10, unlockCode.length));
        if (next.endsWith(unlockCode)) {
          setTimeout(() => onUnlock(), 0);
          return "";
        }
        return next;
      });
    } else {
      setBuffer("");
    }

    if (char === "C") {
      setDisplay("0");
      setPrev(null);
      setOp(null);
      setReplaceNext(false);
      return;
    }

    if (char === "#") {
      return;
    }

    if (char === "±") {
      const n = parseFloat(display);
      if (!Number.isNaN(n)) setDisplay(String(-n));
      return;
    }

    if (char === "%") {
      const n = parseFloat(display);
      if (!Number.isNaN(n)) setDisplay(String(n / 100));
      return;
    }

    if (OPS.includes(char as typeof OPS[number])) {
      const current = parseFloat(display);
      if (Number.isNaN(current)) return;
      if (op !== null && prev !== null) {
        const result = compute(prev, op, current);
        setDisplay(String(result));
        setPrev(result);
      } else {
        setPrev(current);
      }
      setOp(char);
      setReplaceNext(true);
      return;
    }

    if (char === "=") {
      if (op === null || prev === null) return;
      const current = parseFloat(display);
      if (Number.isNaN(current)) return;
      const result = compute(prev, op, current);
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setReplaceNext(true);
      return;
    }

    // Digit or "."
    if (replaceNext) {
      setDisplay(char === "." ? "0." : char);
      setReplaceNext(false);
    } else {
      setDisplay((d) => {
        if (char === ".") {
          if (d.includes(".")) return d;
          return d + ".";
        }
        if (d === "0" && char !== ".") return char;
        return (d + char).slice(0, 20);
      });
    }
  }, [display, op, prev, replaceNext, onUnlock, unlockCode, codeChars]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-twilight-bg flex flex-col justify-end"
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 text-twilight-muted hover:text-twilight-text text-sm font-normal"
          >
            ← 返回
          </button>
        )}
        <div className="p-4 text-right">
          <div className="text-4xl font-mono text-twilight-text min-h-[48px] truncate font-light">
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
                className={`h-14 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-twilight-text text-xl font-normal shadow-soft
                  ${span === 2 ? "col-span-2" : ""}`}
                onClick={() => handleKey(key)}
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
