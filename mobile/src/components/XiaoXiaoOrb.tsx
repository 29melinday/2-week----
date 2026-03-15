import React from "react";
import { View, StyleSheet } from "react-native";

interface XiaoXiaoOrbProps {
  orbColor?: string;
  orbColorSecond?: string;
  isSpeaking?: boolean;
}

export default function XiaoXiaoOrb({
  orbColor = "#F2C94C",
  orbColorSecond = "#BB9AF7",
  isSpeaking = false,
}: XiaoXiaoOrbProps) {
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.outer,
          {
            backgroundColor: orbColor,
            opacity: 0.5,
            shadowColor: orbColor,
            transform: [{ scale: isSpeaking ? 1.08 : 1.02 }],
          },
        ]}
      />
      <View
        style={[
          styles.inner,
          {
            backgroundColor: orbColorSecond,
            opacity: 0.4,
          },
        ]}
      />
    </View>
  );
}

const size = 160;
const styles = StyleSheet.create({
  wrap: { width: size, height: size, alignItems: "center", justifyContent: "center" },
  outer: {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: size / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  inner: {
    width: size * 0.75,
    height: size * 0.75,
    borderRadius: (size * 0.75) / 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
});
