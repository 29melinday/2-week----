"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { getCapsuleList } from "@/lib/capsuleStorage";
import { getBreatheCount } from "@/lib/statsStorage";
import { MOOD_COLORS } from "@/lib/constants";
import type { MoodStone } from "./MoodRiver";

const MOOD_LABELS: Record<string, string> = {
  calm: "平靜",
  sad: "難過",
  anxious: "焦慮",
  angry: "生氣",
  hopeful: "有希望",
  tired: "累",
  okay: "還好",
  other: "其他",
};

interface StatsViewProps {
  stones: MoodStone[];
  visible: boolean;
  onClose: () => void;
}

export default function StatsView({ stones, visible, onClose }: StatsViewProps) {
  const stats = useMemo(() => {
    const total = stones.length;
    const byMood: Record<string, number> = {};
    stones.forEach((s) => {
      byMood[s.moodId] = (byMood[s.moodId] ?? 0) + 1;
    });
    const moodBreakdown = Object.entries(byMood).map(([id, count]) => ({
      id,
      label: MOOD_LABELS[id] ?? id,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
    moodBreakdown.sort((a, b) => b.count - a.count);

    const capsules = getCapsuleList();
    const breatheCount = getBreatheCount();

    return {
      totalStones: total,
      moodBreakdown,
      capsuleCount: capsules.length,
      breatheCount,
    };
  }, [stones]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-twilight-bg overflow-y-auto"
    >
      <div className="max-w-lg mx-auto p-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-twilight-amber font-semibold">我的紀錄</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="rounded-3xl px-4 py-2 text-twilight-text border border-white/20 bg-white/10 hover:bg-white/20 text-sm"
          >
            關閉
          </button>
        </div>

        <p className="text-twilight-muted text-sm mb-6">
          看看你為自己做了多少事，值得給自己一點鼓勵。
        </p>

        {/* Mood pebbles summary */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-4"
        >
          <h3 className="text-twilight-text font-semibold mb-1">心情石頭</h3>
          <p className="text-2xl font-light text-twilight-amber mb-4">
            {stats.totalStones}
            <span className="text-base text-twilight-muted font-normal ml-1">顆</span>
          </p>
          {stats.totalStones > 0 ? (
            <>
              <p className="text-sm text-twilight-muted mb-3">心情類型比例</p>
              <div className="space-y-2">
                {stats.moodBreakdown.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="text-twilight-text text-sm w-20 shrink-0">{m.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.pct}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: MOOD_COLORS[m.id]
                            ? `${MOOD_COLORS[m.id]}cc`
                            : "rgba(242, 201, 76, 0.6)",
                        }}
                      />
                    </div>
                    <span className="text-twilight-muted text-sm w-12 text-right">
                      {m.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-twilight-muted">尚未記錄心情</p>
          )}
        </motion.section>

        {/* Breathing */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 mb-4"
        >
          <h3 className="text-twilight-text font-semibold mb-1">呼吸練習</h3>
          <p className="text-2xl font-light text-twilight-amber">
            {stats.breatheCount}
            <span className="text-base text-twilight-muted font-normal ml-1">次</span>
          </p>
          <p className="text-sm text-twilight-muted mt-1">
            你已經做了 {stats.breatheCount} 次 4-7-8 呼吸，照顧自己很棒。
          </p>
        </motion.section>

        {/* Capsules */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 mb-4"
        >
          <h3 className="text-twilight-text font-semibold mb-1">時光膠囊</h3>
          <p className="text-2xl font-light text-twilight-amber">
            {stats.capsuleCount}
            <span className="text-base text-twilight-muted font-normal ml-1">個</span>
          </p>
          <p className="text-sm text-twilight-muted mt-1">
            {stats.capsuleCount > 0
              ? "寫給未來的自己，都是珍貴的禮物。"
              : "試試寫一封給 30 天後的自己。"}
          </p>
        </motion.section>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-twilight-muted/80 text-sm mt-8"
        >
          持續記錄與練習，會看見自己的變化。
        </motion.p>
      </div>
    </motion.div>
  );
}
