import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { getCapsuleList } from "../lib/capsuleStorage";
import { getBreatheCount } from "../lib/statsStorage";
import { MOOD_COLORS, COLORS } from "../lib/constants";
import type { MoodStone } from "../types";

const MOOD_LABELS: Record<string, string> = {
  calm: "平靜", sad: "難過", anxious: "焦慮", angry: "生氣",
  hopeful: "有希望", tired: "累", okay: "還好", other: "其他",
};

interface StatsViewProps {
  stones: MoodStone[];
  visible: boolean;
  onClose: () => void;
}

export default function StatsView({ stones, visible, onClose }: StatsViewProps) {
  const [capsuleCount, setCapsuleCount] = useState(0);
  const [breatheCount, setBreatheCount] = useState(0);

  useEffect(() => {
    if (visible) {
      getCapsuleList().then((l) => setCapsuleCount(l.length));
      getBreatheCount().then(setBreatheCount);
    }
  }, [visible]);

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

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>我的紀錄</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>關閉</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>心情石頭</Text>
            <Text style={styles.bigNum}>{total}<Text style={styles.unit}> 顆</Text></Text>
            {total > 0 && (
              <>
                <Text style={styles.label}>心情類型比例</Text>
                {moodBreakdown.map((m) => (
                  <View key={m.id} style={styles.row}>
                    <Text style={styles.moodName}>{m.label}</Text>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${m.pct}%`, backgroundColor: (MOOD_COLORS[m.id] || COLORS.amber) + "cc" }]} />
                    </View>
                    <Text style={styles.pct}>{m.pct}%</Text>
                  </View>
                ))}
              </>
            )}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>呼吸練習</Text>
            <Text style={styles.bigNum}>{breatheCount}<Text style={styles.unit}> 次</Text></Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>時光膠囊</Text>
            <Text style={styles.bigNum}>{capsuleCount}<Text style={styles.unit}> 個</Text></Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 18, fontWeight: "600", color: COLORS.amber },
  closeText: { fontSize: 14, color: COLORS.text },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: COLORS.card, borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  bigNum: { fontSize: 28, color: COLORS.amber, marginVertical: 8 },
  unit: { fontSize: 14, color: COLORS.muted, fontWeight: "400" },
  label: { fontSize: 12, color: COLORS.muted, marginTop: 12, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  moodName: { width: 60, fontSize: 13, color: COLORS.text },
  barBg: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  pct: { width: 36, fontSize: 13, color: COLORS.muted, textAlign: "right" },
});
