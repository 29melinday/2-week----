"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SOSOverlayProps {
  visible: boolean;
  onDismiss?: () => void;
}

export default function SOSOverlay({ visible, onDismiss }: SOSOverlayProps) {
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (!navigator.geolocation) {
      setLocation("無法取得位置");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      () => setLocation("無法取得位置"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-lo-fi-sos/95 flex flex-col items-center justify-center p-6 text-white"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-md w-full text-center space-y-6"
      >
        <h2 className="text-2xl font-bold">需要協助時，請撥打</h2>
        <a
          href="tel:1925"
          className="block w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-xl font-semibold"
        >
          1925 安心專線
        </a>
        <a
          href="tel:110"
          className="block w-full py-4 rounded-xl bg-red-700 hover:bg-red-600 text-xl font-semibold"
        >
          110 報案專線
        </a>
        {location && (
          <p className="text-sm text-white/90 pt-2">
            您當前位置：{location}
          </p>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-white/70 text-sm underline"
          >
            關閉
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
