"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSettings } from "@/lib/settingsStorage";

const ROUTES = [
  { name: "307", from: "板橋前站", to: "莊敬里" },
  { name: "299", from: "新莊", to: "永春高中" },
  { name: "藍2", from: "西盛", to: "二二八和平公園" },
];

interface BusItem {
  routeName: string;
  stopName: string;
  estimateText: string;
}

interface BusTrackerProps {
  onLongPressTrigger: () => void;
  tutorialStep?: number;
  accentColor?: string;
}

export default function BusTracker({ onLongPressTrigger, tutorialStep = 0, accentColor: accentProp }: BusTrackerProps) {
  const [data, setData] = useState<BusItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState("1分鐘前");
  const [loading, setLoading] = useState(true);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTarget = useRef<EventTarget | null>(null);
  const [accentColor, setAccentColor] = useState(accentProp ?? getSettings().accentColor);
  useEffect(() => {
    if (accentProp) setAccentColor(accentProp);
  }, [accentProp]);
  const fetchBus = useCallback(async () => {
    try {
      const res = await fetch("/api/bus");
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
      setLastUpdate("1分鐘前");
    } catch {
      setData([
        { routeName: "307", stopName: "捷運西門站", estimateText: "3 分" },
        { routeName: "307", stopName: "捷運西門站", estimateText: "8 分" },
        { routeName: "299", stopName: "新莊區公所", estimateText: "2 分" },
        { routeName: "299", stopName: "新莊區公所", estimateText: "7 分" },
        { routeName: "藍2", stopName: "板橋公車站", estimateText: "4 分" },
        { routeName: "藍2", stopName: "板橋公車站", estimateText: "9 分" },
      ]);
      setLastUpdate("1分鐘前");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBus();
    const interval = setInterval(fetchBus, 60000);
    return () => clearInterval(interval);
  }, [fetchBus]);

  const handleLongPressStart = (e: React.MouseEvent | React.TouchEvent) => {
    longPressTarget.current = e.target as EventTarget;
    longPressTimer.current = setTimeout(() => {
      onLongPressTrigger();
      longPressTimer.current = null;
    }, 3000);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const grouped = ROUTES.map((r) => ({
    ...r,
    items: data.filter((d) => d.routeName === r.name),
  }));

  return (
    <div className="min-h-screen bg-twilight-bg text-twilight-text flex flex-col">
      <header className="p-4 border-b border-white/10">
        <h1 className="text-xl font-semibold text-twilight-text">TP Bus Tracker</h1>
        <p className="text-sm text-twilight-muted mt-1 font-normal">台北公車通 · 即時到站</p>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {loading ? (
          <div className="text-twilight-muted animate-pulse font-normal">載入中...</div>
        ) : (
          grouped.map((group) => (
            <motion.section
              key={group.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <h2 className="text-lg font-semibold text-twilight-amber mb-2" style={{color: accentColor}}>
                {group.name} · {group.from} → {group.to}
              </h2>
              <ul className="space-y-2 leading-relaxed">
                {(group.items.length ? group.items : [{ routeName: group.name, stopName: "—", estimateText: "—" }]).map((item, i) => (
                  <li key={i} className="flex justify-between text-sm font-normal">
                    <span className="text-twilight-text/90" >{item.stopName}</span>
                    <span className="text-twilight-amber font-medium" style={{color: accentColor}}>{item.estimateText}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))
        )}
      </main>
      <footer className="p-4 border-t border-white/10 text-center">
        <button
          type="button"
          className={`w-full py-2 rounded-3xl text-sm font-normal border transition-colors ${tutorialStep === 1 ? "animate-pulse" : "text-twilight-muted hover:text-twilight-text hover:bg-white/5 hover:border-white/10"}`}
          style={
            tutorialStep === 1
              ? { color: accentColor, borderColor: `${accentColor}99`, backgroundColor: `${accentColor}15` }
              : { borderColor: "transparent" }
          }
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          onTouchCancel={handleLongPressEnd}
        >
          {tutorialStep === 1 ? "👆 長按這裡 3 秒" : `更新時間：${lastUpdate}`}
        </button>
      </footer>
    </div>
  );
}
