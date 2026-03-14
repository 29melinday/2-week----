"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BusTracker from "@/components/BusTracker";
import Calculator from "@/components/Calculator";
import XiaoXiaoView from "@/components/XiaoXiaoView";

type Screen = "bus" | "calculator" | "xiaoxiao";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("bus");
  const [showUnlockTransition, setShowUnlockTransition] = useState(false);

  const openCalculator = useCallback(() => setScreen("calculator"), []);
  const unlockToXiaoXiao = useCallback(() => {
    setShowUnlockTransition(true);
    setTimeout(() => {
      setScreen("xiaoxiao");
      setShowUnlockTransition(false);
    }, 1200);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {screen === "bus" && (
          <motion.div
            key="bus"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BusTracker onLongPressTrigger={openCalculator} />
          </motion.div>
        )}

        {screen === "calculator" && !showUnlockTransition && (
          <motion.div
            key="calculator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <Calculator
              visible
              onUnlock={unlockToXiaoXiao}
              onClose={() => setScreen("bus")}
            />
          </motion.div>
        )}

        {showUnlockTransition && (
          <motion.div
            key="transition"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-lo-fi-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-4 h-4 rounded-full bg-lo-fi-accent/80"
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{
                scale: 80,
                opacity: [1, 1, 0.8],
                transition: { duration: 1.2, ease: "easeInOut" },
              }}
            />
          </motion.div>
        )}

        {screen === "xiaoxiao" && (
          <motion.div
            key="xiaoxiao"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <XiaoXiaoView />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
