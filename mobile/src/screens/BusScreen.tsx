import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { getSettings } from "../lib/settingsStorage";
import { fetchBus } from "../lib/api";
import { BUS_ROUTES } from "../lib/constants";
import { COLORS } from "../lib/constants";
import TutorialOverlay from "../components/TutorialOverlay";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Bus">;
};

interface BusItem {
  routeName: string;
  stopName: string;
  estimateText: string;
}

export default function BusScreen({ navigation }: Props) {
  const [data, setData] = useState<BusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [accentColor, setAccentColor] = useState(COLORS.amber);
  const [showTutorial, setShowTutorial] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const s = await getSettings();
    setAccentColor(s.accentColor);
    const list = await fetchBus();
    setData(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    (async () => {
      const { tutorialDone } = await import("../lib/tutorialStorage");
      const done = await tutorialDone();
      setShowTutorial(!done);
    })();
  }, []);

  const onLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      navigation.navigate("Calculator");
      longPressTimer.current = null;
    }, 3000);
  };

  const onLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const grouped = BUS_ROUTES.map((r) => ({
    ...r,
    items: data.filter((d) => d.routeName === r.name),
  }));

  const defaultItems = [{ routeName: "—", stopName: "—", estimateText: "—" }];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TP Bus Tracker</Text>
        <Text style={styles.subtitle}>台北公車通 · 即時到站</Text>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
        {loading ? (
          <ActivityIndicator size="large" color={accentColor} style={styles.loader} />
        ) : (
          grouped.map((group) => (
            <View key={group.name} style={styles.card}>
              <Text style={[styles.cardTitle, { color: accentColor }]}>
                {group.name} · {group.from} → {group.to}
              </Text>
              {(group.items.length ? group.items : defaultItems).map((item, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.stopName}>{item.stopName}</Text>
                  <Text style={[styles.estimate, { color: accentColor }]}>{item.estimateText}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerBtn}
          onPressIn={onLongPressStart}
          onPressOut={onLongPressEnd}
          onLongPress={onLongPressEnd}
          activeOpacity={1}
        >
          <Text style={styles.footerText}>更新時間：1分鐘前</Text>
        </TouchableOpacity>
      </View>

      <TutorialOverlay
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: "600", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  main: { flex: 1 },
  mainContent: { padding: 16, paddingBottom: 24 },
  loader: { marginTop: 24 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  stopName: { fontSize: 14, color: COLORS.text },
  estimate: { fontSize: 14, fontWeight: "500" },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: "center" },
  footerBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  footerText: { fontSize: 14, color: COLORS.muted },
});
