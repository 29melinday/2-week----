"use client";

import { motion } from "framer-motion";

interface ResourceMapProps {
  visible: boolean;
  onClose: () => void;
}

// 台北市青少年友善資源範例（可改為 Google Maps API + Places）
const MOCK_RESOURCES = [
  { name: "台北市社區心理衛生中心", address: "台北市中正區", tel: "02-3393-6779", lat: 25.0330, lng: 121.5654 },
  { name: "張老師基金會", address: "台北市大安區", tel: "1980", lat: 25.0260, lng: 121.5436 },
  { name: "生命線協談專線", address: "24小時", tel: "1995", lat: 25.04, lng: 121.55 },
];

export default function ResourceMap({ visible, onClose }: ResourceMapProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-lo-fi-bg flex flex-col"
    >
      <header className="flex items-center justify-between p-4 border-b border-lo-fi-muted">
        <h2 className="text-lg text-lo-fi-accent">資源地圖</h2>
        <button type="button" onClick={onClose} className="text-lo-fi-muted text-sm">
          關閉
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {MOCK_RESOURCES.map((r) => (
          <motion.div
            key={r.name}
            className="bg-lo-fi-card rounded-xl p-4 border border-lo-fi-muted/50"
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-lo-fi-warm font-medium">{r.name}</h3>
            <p className="text-sm text-lo-fi-muted mt-1">{r.address}</p>
            <p className="text-sm text-lo-fi-accent mt-1">電話：{r.tel}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-lo-fi-accent underline"
            >
              一鍵導航
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
