import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import XiaoXiaoOrb from "../components/XiaoXiaoOrb";
import MoodRiver, { MoodStone } from "../components/MoodRiver";
import BreatheMode from "../components/BreatheMode";
import TimeCapsule from "../components/TimeCapsule";
import ResourceMap from "../components/ResourceMap";
import StatsView from "../components/StatsView";
import SettingsView from "../components/SettingsView";
import SOSOverlay from "../components/SOSOverlay";
import { checkSOS } from "../lib/sos";
import { getSettings } from "../lib/settingsStorage";
import { getMoodStones, saveMoodStones } from "../lib/moodStorage";
import { incrementBreatheCount } from "../lib/statsStorage";
import { getReadyToOpenCount } from "../lib/capsuleStorage";
import { fetchChat } from "../lib/api";
import { STRESS_KEYWORDS } from "../lib/constants";
import { COLORS } from "../lib/constants";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "XiaoXiao">;
};

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export default function XiaoXiaoScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [stones, setStones] = useState<MoodStone[]>([]);
  const [sosVisible, setSosVisible] = useState(false);
  const [breatheVisible, setBreatheVisible] = useState(false);
  const [capsuleVisible, setCapsuleVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [readyCapsuleCount, setReadyCapsuleCount] = useState(0);
  const [accentColor, setAccentColor] = useState(COLORS.amber);
  const [orbColor, setOrbColor] = useState(COLORS.amber);
  const [orbColorSecond, setOrbColorSecond] = useState(COLORS.violet);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const loadData = useCallback(async () => {
    const [s, moodList] = await Promise.all([getSettings(), getMoodStones()]);
    setAccentColor(s.accentColor);
    setOrbColor(s.orbColor);
    setOrbColorSecond(s.orbColorSecond);
    setStones(moodList);
    setReadyCapsuleCount(await getReadyToOpenCount());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (settingsVisible) loadData();
  }, [settingsVisible, loadData]);

  useEffect(() => {
    if (capsuleVisible) getReadyToOpenCount().then(setReadyCapsuleCount);
  }, [capsuleVisible]);

  const addStone = useCallback(async (moodId: string, color: string) => {
    const newStone: MoodStone = {
      id: `stone-${Date.now()}`,
      moodId,
      color,
      createdAt: Date.now(),
    };
    const next = [...stones, newStone];
    setStones(next);
    await saveMoodStones(next);
  }, [stones]);

  useEffect(() => {
    if (stones.length > 0) saveMoodStones(stones);
  }, [stones]);

  const sendMessage = useCallback(async () => {
    const t = input.trim();
    if (!t) return;
    if (checkSOS(t)) {
      setSosVisible(true);
      return;
    }
    if (STRESS_KEYWORDS.some((k) => t.includes(k))) setBreatheVisible(true);
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: t, timestamp: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsSpeaking(true);
    const history = [...messages, userMsg].map((m) => ({ role: m.role, text: m.text }));
    try {
      const reply = await fetchChat(history);
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", text: reply, timestamp: Date.now() },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", text: "我在聽。你願意多說一點嗎？", timestamp: Date.now() },
      ]);
    }
    setTimeout(() => setIsSpeaking(false), 1200);
  }, [input, messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 400);
    }
  }, [messages.length, messages[messages.length - 1]?.id]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
      <TouchableOpacity style={styles.backBar} onPress={() => navigation.navigate("Bus")}>
        <Text style={styles.backText}>← 返回公車</Text>
      </TouchableOpacity>
      {readyCapsuleCount > 0 && (
        <TouchableOpacity style={styles.capsuleBanner} onPress={() => setCapsuleVisible(true)}>
          <Text style={styles.capsuleBannerText}>✨ 你有 {readyCapsuleCount} 個時光膠囊可以打開</Text>
        </TouchableOpacity>
      )}

      <MoodRiver stones={stones} onAddStone={addStone} />

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.orbWrap}>
          <XiaoXiaoOrb orbColor={orbColor} orbColorSecond={orbColorSecond} isSpeaking={isSpeaking} />
        </View>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.msgRow, msg.role === "user" && styles.msgRowUser]}>
            <View style={[styles.bubble, msg.role === "user" ? styles.bubbleUser : styles.bubbleAssistant]}>
              <Text style={styles.bubbleText}>{msg.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="跟小曉說說話..."
          placeholderTextColor={COLORS.muted}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={[styles.sendBtn, { borderColor: accentColor + "66", backgroundColor: accentColor + "1a" }]} onPress={sendMessage}>
          <Text style={[styles.sendBtnText, { color: accentColor }]}>送出</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footBtn} onPress={() => setBreatheVisible(true)}>
          <Text style={styles.footBtnText}>呼吸練習</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footBtn} onPress={() => setCapsuleVisible(true)}>
          <Text style={styles.footBtnText}>時光膠囊</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footBtn} onPress={() => setMapVisible(true)}>
          <Text style={styles.footBtnText}>資源地圖</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footBtn, styles.footBtnAccent]} onPress={() => setStatsVisible(true)}>
          <Text style={[styles.footBtnText, { color: accentColor }]}>我的紀錄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footBtn} onPress={() => setSettingsVisible(true)}>
          <Text style={styles.footBtnText}>設定</Text>
        </TouchableOpacity>
      </View>

      <BreatheMode
        visible={breatheVisible}
        onClose={() => setBreatheVisible(false)}
        onCycleComplete={() => incrementBreatheCount()}
        orbColor={orbColor}
        orbColorSecond={orbColorSecond}
      />
      <TimeCapsule visible={capsuleVisible} onClose={() => setCapsuleVisible(false)} onCapsuleOpened={() => getReadyToOpenCount().then(setReadyCapsuleCount)} />
      <ResourceMap visible={mapVisible} onClose={() => setMapVisible(false)} />
      <StatsView stones={stones} visible={statsVisible} onClose={() => setStatsVisible(false)} />
      <SettingsView visible={settingsVisible} onClose={() => setSettingsVisible(false)} onSettingsChange={loadData} />
      <SOSOverlay visible={sosVisible} onDismiss={() => setSosVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  backBar: { padding: 12, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backText: { fontSize: 14, color: COLORS.muted },
  capsuleBanner: { padding: 12, backgroundColor: COLORS.amber + "20", borderBottomWidth: 1, borderBottomColor: COLORS.amber + "40" },
  capsuleBannerText: { fontSize: 13, color: COLORS.amber },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24 },
  orbWrap: { alignItems: "center", paddingVertical: 16 },
  msgRow: { marginBottom: 12, alignItems: "flex-start" },
  msgRowUser: { alignItems: "flex-end" },
  bubble: { maxWidth: "85%", borderRadius: 24, padding: 14, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  bubbleUser: { backgroundColor: "rgba(255,255,255,0.1)" },
  bubbleAssistant: {},
  bubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  inputRow: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.card, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, borderWidth: 1 },
  sendBtnText: { fontSize: 14, fontWeight: "600" },
  footer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: 28 },
  footBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  footBtnAccent: { borderColor: COLORS.amber + "66", backgroundColor: COLORS.amber + "15" },
  footBtnText: { fontSize: 13, color: COLORS.text },
});
