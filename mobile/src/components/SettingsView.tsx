import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { getSettings, saveSettings } from "../lib/settingsStorage";
import { clearTutorialDone } from "../lib/tutorialStorage";
import { COLORS } from "../lib/constants";

const PRESETS = [
  { name: "琥珀", value: "#F2C94C" },
  { name: "淡紫", value: "#BB9AF7" },
  { name: "青綠", value: "#2AC3DE" },
  { name: "藍", value: "#7AA2F7" },
  { name: "粉", value: "#F5B0CB" },
  { name: "薄荷", value: "#98D8C8" },
];

interface SettingsViewProps {
  visible: boolean;
  onClose: () => void;
  onSettingsChange?: () => void;
}

export default function SettingsView({ visible, onClose, onSettingsChange }: SettingsViewProps) {
  const [unlockCode, setUnlockCode] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [orbColor, setOrbColor] = useState("");
  const [orbColorSecond, setOrbColorSecond] = useState("");

  useEffect(() => {
    if (visible) {
      getSettings().then((s) => {
        setUnlockCode(s.unlockCode);
        setAccentColor(s.accentColor);
        setOrbColor(s.orbColor);
        setOrbColorSecond(s.orbColorSecond);
      });
    }
  }, [visible]);

  const handleSave = async () => {
    await saveSettings({
      unlockCode: unlockCode.trim() || "110#",
      accentColor: accentColor || "#F2C94C",
      orbColor: orbColor || "#F2C94C",
      orbColorSecond: orbColorSecond || "#BB9AF7",
    });
    onSettingsChange?.();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>設定</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>關閉</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>進入密碼</Text>
            <TextInput
              style={styles.input}
              value={unlockCode}
              onChangeText={(t) => setUnlockCode(t.replace(/[^0-9#]/g, ""))}
              placeholder="110#"
              placeholderTextColor={COLORS.muted}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>介面主色</Text>
            <View style={styles.presets}>
              {PRESETS.map((p) => (
                <TouchableOpacity key={p.value} style={[styles.presetBtn, { backgroundColor: p.value }]} onPress={() => setAccentColor(p.value)} />
              ))}
            </View>
            <TextInput style={styles.input} value={accentColor} onChangeText={setAccentColor} placeholder="#F2C94C" placeholderTextColor={COLORS.muted} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>小曉光球顏色（第一色 / 第二色）</Text>
            <View style={styles.presets}>
              {PRESETS.map((p) => (
                <TouchableOpacity key={"o1-" + p.value} style={[styles.presetBtn, { backgroundColor: p.value }]} onPress={() => setOrbColor(p.value)} />
              ))}
            </View>
            <TextInput style={styles.input} value={orbColor} onChangeText={setOrbColor} placeholder="#F2C94C" placeholderTextColor={COLORS.muted} />
            <View style={[styles.presets, { marginTop: 8 }]}>
              {PRESETS.map((p) => (
                <TouchableOpacity key={"o2-" + p.value} style={[styles.presetBtn, { backgroundColor: p.value }]} onPress={() => setOrbColorSecond(p.value)} />
              ))}
            </View>
            <TextInput style={styles.input} value={orbColorSecond} onChangeText={setOrbColorSecond} placeholder="#BB9AF7" placeholderTextColor={COLORS.muted} />
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>儲存設定</Text>
          </TouchableOpacity>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>使用教學</Text>
            <TouchableOpacity
              style={styles.tutorialBtn}
              onPress={async () => {
                await clearTutorialDone();
                onClose();
              }}
            >
              <Text style={styles.tutorialBtnText}>重新顯示使用教學</Text>
            </TouchableOpacity>
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
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 },
  input: { backgroundColor: COLORS.card, borderRadius: 16, padding: 12, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  presetBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.card, borderRadius: 24, padding: 16, alignItems: "center", marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  saveBtnText: { fontSize: 16, fontWeight: "500", color: COLORS.text },
  tutorialBtn: { padding: 12 },
  tutorialBtnText: { fontSize: 13, color: COLORS.muted },
});
