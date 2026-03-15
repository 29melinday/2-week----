import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { MOOD_COLORS, COLORS } from "../lib/constants";
import type { MoodStone } from "../types";

export type { MoodStone };

const MOOD_OPTIONS = [
  { id: "calm", label: "平靜" },
  { id: "sad", label: "難過" },
  { id: "anxious", label: "焦慮" },
  { id: "angry", label: "生氣" },
  { id: "hopeful", label: "有希望" },
  { id: "tired", label: "累" },
  { id: "okay", label: "還好" },
  { id: "other", label: "其他" },
];

interface MoodRiverProps {
  stones: MoodStone[];
  onAddStone: (moodId: string, color: string) => void;
}

export default function MoodRiver({ stones, onAddStone }: MoodRiverProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.river}
      >
        {stones.length === 0 ? (
          <Text style={styles.empty}>點下方記錄心情，讓石頭流入河裡</Text>
        ) : (
          stones.slice(-30).map((s) => (
            <View
              key={s.id}
              style={[styles.pebble, { backgroundColor: s.color || MOOD_COLORS[s.moodId] || COLORS.amber }]}
            />
          ))
        )}
      </ScrollView>
      <View style={styles.actions}>
        <Text style={styles.label}>記錄心情</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
          {MOOD_OPTIONS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.option, { backgroundColor: MOOD_COLORS[m.id] || COLORS.amber }]}
              onPress={() => onAddStone(m.id, MOOD_COLORS[m.id] || COLORS.amber)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionText}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  river: { minHeight: 40, alignItems: "center", gap: 6, flexDirection: "row", paddingRight: 16 },
  empty: { fontSize: 13, color: COLORS.muted },
  pebble: { width: 20, height: 20, borderRadius: 10 },
  actions: { marginTop: 12 },
  label: { fontSize: 12, color: COLORS.muted, marginBottom: 8 },
  options: { flexDirection: "row", gap: 8 },
  option: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  optionText: { fontSize: 13, color: "#1A1B26", fontWeight: "500" },
});
