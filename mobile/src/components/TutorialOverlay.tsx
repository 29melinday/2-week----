import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getSettings } from "../lib/settingsStorage";
import { COLORS } from "../lib/constants";

const STEPS = [
  { title: "歡迎使用 行善台北", body: "這個畫面看起來是公車動態，可以低調使用。接下來會一步一步介紹如何進入小曉的空間，以及裡面的每個功能。" },
  { title: "第一步：打開秘密入口", body: "在畫面下方找到「更新時間：1分鐘前」那一行，用手指「長按約 3 秒」不要放開，就會跳出計算機。" },
  { title: "第二步：輸入進入密碼", body: "計算機出現後，在計算機上依序輸入您的進入密碼。輸入正確後會進入小曉介面。可在「設定」中更改密碼。" },
  { title: "小曉與聊天", body: "中間的發光圓球就是小曉。在下方輸入框打字、按送出，就能和小曉聊天。" },
  { title: "心情河流", body: "畫面上方可以選一種當下的情緒記錄下來，像一顆石頭放進河裡。" },
  { title: "呼吸定錨", body: "點「呼吸練習」可進入 4-7-8 呼吸法：吸氣 4 秒、屏息 7 秒、吐氣 8 秒。" },
  { title: "時光膠囊", body: "寫一封信給 30 天後的自己。封存後要等 30 天才能打開。" },
  { title: "資源地圖", body: "依您的位置列出台北市的心理與諮商資源，由近到遠。生命線 1995、張老師 1980、安心專線 1925。" },
  { title: "我的紀錄與設定", body: "「我的紀錄」可看心情比例、呼吸次數、膠囊數。「設定」可自訂密碼與顏色。畫面上方「返回公車」可回到公車畫面。" },
  { title: "準備好了", body: "需要時就長按進入，和小曉說說話、記一下心情，或做個呼吸練習。祝您一切安好。" },
];

interface TutorialOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export default function TutorialOverlay({ visible, onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [unlockCode, setUnlockCode] = useState("110#");

  useEffect(() => {
    if (visible) getSettings().then((s) => setUnlockCode(s.unlockCode || "110#"));
  }, [visible]);

  const content = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleNext = async () => {
    if (isLast) {
      const { setTutorialDone } = await import("../lib/tutorialStorage");
      await setTutorialDone();
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = async () => {
    const { setTutorialDone } = await import("../lib/tutorialStorage");
    await setTutorialDone();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.body}>{content.body}</Text>
          {step === 2 && <Text style={styles.code}>目前密碼：{unlockCode}</Text>}
          <View style={styles.actions}>
            <View style={styles.left}>
              {!isFirst && (
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep((s) => s - 1)}>
                  <Text style={styles.backText}>上一步</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleSkip}>
                <Text style={styles.skipText}>略過</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextText}>{isLast ? "開始使用" : "下一步"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 18, fontWeight: "600", color: COLORS.amber, marginBottom: 12 },
  body: { fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 16 },
  code: { fontSize: 12, color: COLORS.muted, marginBottom: 16 },
  actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  backText: { fontSize: 14, color: COLORS.text },
  skipText: { fontSize: 13, color: COLORS.muted },
  nextBtn: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  nextText: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { width: 20, backgroundColor: COLORS.amber },
});
