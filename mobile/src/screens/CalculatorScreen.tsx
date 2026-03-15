import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { getSettings } from "../lib/settingsStorage";
import { COLORS } from "../lib/constants";

const KEY_ROWS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["#", "0", ".", "="],
];

const OPS = ["÷", "×", "−", "+"] as const;
const DEFAULT_UNLOCK = "110#";

function compute(a: number, op: string, b: number): number {
  let result: number;
  switch (op) {
    case "+": result = a + b; break;
    case "−": result = a - b; break;
    case "×": result = a * b; break;
    case "÷": result = b === 0 ? 0 : a / b; break;
    default: result = b;
  }
  return Number.isInteger(result) ? result : Math.round(result * 1e10) / 1e10;
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Calculator">;
};

export default function CalculatorScreen({ navigation }: Props) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [buffer, setBuffer] = useState("");
  const [replaceNext, setReplaceNext] = useState(false);
  const [unlockCode, setUnlockCode] = useState(DEFAULT_UNLOCK);

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setUnlockCode(s.unlockCode || DEFAULT_UNLOCK);
    })();
  }, []);

  const codeChars = useMemo(
    () => new Set([..."0123456789#"].filter((c) => unlockCode.includes(c))),
    [unlockCode]
  );

  const handleKey = useCallback(
    (char: string) => {
      if (codeChars.has(char)) {
        setBuffer((b) => {
          const next = (b + char).slice(-Math.max(10, unlockCode.length));
          if (next.endsWith(unlockCode)) {
            setTimeout(() => navigation.replace("XiaoXiao"), 0);
            return "";
          }
          return next;
        });
      } else {
        setBuffer("");
      }

      if (char === "C") {
        setDisplay("0");
        setPrev(null);
        setOp(null);
        setReplaceNext(false);
        return;
      }
      if (char === "#") return;
      if (char === "±") {
        const n = parseFloat(display);
        if (!Number.isNaN(n)) setDisplay(String(-n));
        return;
      }
      if (char === "%") {
        const n = parseFloat(display);
        if (!Number.isNaN(n)) setDisplay(String(n / 100));
        return;
      }
      if (OPS.includes(char as (typeof OPS)[number])) {
        const current = parseFloat(display);
        if (Number.isNaN(current)) return;
        if (op !== null && prev !== null) {
          const result = compute(prev, op, current);
          setDisplay(String(result));
          setPrev(result);
        } else setPrev(current);
        setOp(char);
        setReplaceNext(true);
        return;
      }
      if (char === "=") {
        if (op === null || prev === null) return;
        const current = parseFloat(display);
        if (Number.isNaN(current)) return;
        const result = compute(prev, op, current);
        setDisplay(String(result));
        setPrev(null);
        setOp(null);
        setReplaceNext(true);
        return;
      }
      if (replaceNext) {
        setDisplay(char === "." ? "0." : char);
        setReplaceNext(false);
      } else {
        setDisplay((d) => {
          if (char === ".") return d.includes(".") ? d : d + ".";
          if (d === "0" && char !== ".") return char;
          return (d + char).slice(0, 20);
        });
      }
    },
    [display, op, prev, replaceNext, unlockCode, codeChars, navigation]
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← 返回</Text>
      </TouchableOpacity>

      <View style={styles.displayWrap}>
        <Text style={styles.display} numberOfLines={1}>
          {display}
        </Text>
      </View>

      <View style={styles.grid}>
        {KEY_ROWS.flat().map((key, idx) => (
          <TouchableOpacity
            key={`${key}-${idx}`}
            style={styles.key}
            onPress={() => handleKey(key)}
            activeOpacity={0.8}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingBottom: 24 },
  backBtn: { padding: 16, alignSelf: "flex-start" },
  backText: { fontSize: 14, color: COLORS.muted },
  displayWrap: { paddingHorizontal: 16, alignItems: "flex-end" },
  display: { fontSize: 40, color: COLORS.text, fontVariant: ["tabular-nums"] },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 10,
    justifyContent: "space-between",
  },
  key: {
    width: "23%",
    aspectRatio: 1.4,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: { fontSize: 22, color: COLORS.text },
});
