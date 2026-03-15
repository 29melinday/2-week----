import React, { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

const PHASES = [
  { label: "吸氣", duration: 4, scale: 1.2 },
  { label: "屏息", duration: 7, scale: 1.2 },
  { label: "吐氣", duration: 8, scale: 0.85 },
];

interface BreatheModeProps {
  visible: boolean;
  onClose: () => void;
  onCycleComplete?: () => void;
  orbColor?: string;
  orbColorSecond?: string;
}

export default function BreatheMode({
  visible,
  onClose,
  onCycleComplete,
  orbColor = "#F2C94C",
  orbColorSecond = "#BB9AF7",
}: BreatheModeProps) {
  const [phase, setPhase] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const current = PHASES[phase];
  const prevScale = phase === 0 ? 0.85 : 1.2;

  useEffect(() => {
    if (!visible) return;
    scaleAnim.setValue(prevScale);
    Animated.timing(scaleAnim, {
      toValue: current.scale,
      duration: current.duration * 1000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      const next = (phase + 1) % PHASES.length;
      setPhase(next);
      if (next === 0) onCycleComplete?.();
    });
  }, [visible, phase]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>關閉</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: orbColor }]}>4-7-8 呼吸法</Text>
        <Animated.View
          style={[
            styles.orbOuter,
            {
              backgroundColor: orbColor,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.orbInner, { backgroundColor: orbColorSecond }]}>
            <Text style={styles.phaseText}>{current.label}</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#1A1B26",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  closeBtn: { position: "absolute", top: 48, right: 24, padding: 8 },
  closeText: { fontSize: 14, color: "#E8E8ED" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 32 },
  orbOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
  },
  orbInner: {
    width: 135,
    height: 135,
    borderRadius: 67.5,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  },
  phaseText: { fontSize: 20, color: "#E8E8ED" },
});
