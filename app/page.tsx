"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BusTracker from "@/components/BusTracker";
import Calculator from "@/components/Calculator";
import XiaoXiaoView from "@/components/XiaoXiaoView";
import TutorialOverlay, { tutorialDone, setTutorialDone } from "@/components/TutorialOverlay";
import { getSettings } from "@/lib/settingsStorage";

type Screen = "bus" | "calculator" | "xiaoxiao";

function TransitionOverlay() {
  const accent = typeof window !== "undefined" ? getSettings().accentColor : "#F2C94C";
  return (
    <motion.div
      key="transition"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-twilight-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: `${accent}cc` }}
        initial={{ scale: 0.1, opacity: 1 }}
        animate={{ scale: 80, opacity: [1, 1, 0.8] }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("bus");
  const [showUnlockTransition, setShowUnlockTransition] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    setShowTutorial(!tutorialDone());
  }, []);

  const openCalculator = useCallback(() => {
    setTutorialStep((s) => (s <= 1 ? 2 : s));
    setScreen("calculator");
  }, []);

  const unlockToXiaoXiao = useCallback(() => {
    setTutorialStep((s) => (s === 2 ? 3 : s));
    setShowUnlockTransition(true);
    setTimeout(() => {
      setScreen("xiaoxiao");
      setShowUnlockTransition(false);
    }, 1200);
  }, []);

  const onTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    setTutorialDone();
  }, []);

  const onRequestShowTutorial = useCallback(() => {
    setShowTutorial(true);
    setTutorialStep(0);
    setScreen("bus");
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
            <BusTracker onLongPressTrigger={openCalculator} tutorialStep={tutorialStep} />
            <TutorialOverlay
              key="tutorial-bus"
              visible={showTutorial}
              step={tutorialStep}
              setStep={setTutorialStep}
              onClose={onTutorialComplete}
              showWhenSteps={[0, 1]}
            />
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
            <TutorialOverlay
              visible={showTutorial && tutorialStep === 2}
              step={tutorialStep}
              setStep={setTutorialStep}
              onClose={onTutorialComplete}
              showWhenSteps={[2]}
            />
          </motion.div>
        )}

        {showUnlockTransition && (
          <TransitionOverlay />
        )}

        {screen === "xiaoxiao" && (
          <motion.div
            key="xiaoxiao"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <XiaoXiaoView
              onBackToBus={() => setScreen("bus")}
              tutorialStep={tutorialStep}
              setTutorialStep={setTutorialStep}
              showTutorial={showTutorial}
              onTutorialComplete={onTutorialComplete}
              onRequestShowTutorial={onRequestShowTutorial}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
