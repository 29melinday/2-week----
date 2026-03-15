import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import {
  getCapsuleList,
  saveCapsuleList,
  getCapsuleContent,
  markCapsuleOpened,
  type CapsuleEntry,
} from "../lib/capsuleStorage";
import { getItem, setItem } from "../lib/storage";
import { COLORS } from "../lib/constants";

interface TimeCapsuleProps {
  visible: boolean;
  onClose: () => void;
  onCapsuleOpened?: () => void;
}

function getDaysLeft(unlockAt: number): number {
  const now = Date.now();
  if (unlockAt <= now) return 0;
  return Math.ceil((unlockAt - now) / (24 * 60 * 60 * 1000));
}

export default function TimeCapsule({ visible, onClose, onCapsuleOpened }: TimeCapsuleProps) {
  const [content, setContent] = useState("");
  const [sealing, setSealing] = useState(false);
  const [list, setList] = useState<CapsuleEntry[]>([]);
  const [openingKey, setOpeningKey] = useState<string | null>(null);
  const [viewingSealed, setViewingSealed] = useState(false);
  const [pastExpanded, setPastExpanded] = useState(false);
  const [openingContent, setOpeningContent] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      getCapsuleList().then(setList);
      setOpeningKey(null);
      setViewingSealed(false);
      setOpeningContent(null);
    }
  }, [visible]);

  const now = Date.now();
  const ready = list.filter((e) => !e.opened && e.unlockAt <= now);
  const allCapsules = [...list].sort((a, b) => (b.unlockAt ?? 0) - (a.unlockAt ?? 0));

  const handleSend = async () => {
    if (!content.trim()) return;
    setSealing(true);
    const key = `capsule-${Date.now()}`;
    const unlockAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    await setItem(key, JSON.stringify({ content: content.trim(), unlockAt }));
    const currentList = await getCapsuleList();
    const nextList = [...currentList, { key, unlockAt, opened: false, createdAt: Date.now() }];
    await saveCapsuleList(nextList);
    setList(nextList);
    setTimeout(() => {
      setSealing(false);
      setContent("");
      onClose();
    }, 1500);
  };

  const handleCapsuleClick = async (e: CapsuleEntry) => {
    const daysLeft = getDaysLeft(e.unlockAt);
    const isUnlocked = daysLeft <= 0 || e.opened;
    if (isUnlocked) {
      const data = await getCapsuleContent(e.key);
      if (data) {
        setOpeningKey(e.key);
        setOpeningContent(data.content);
        setViewingSealed(false);
        if (!e.opened) {
          await markCapsuleOpened(e.key, data.content);
          onCapsuleOpened?.();
          setList(await getCapsuleList());
        }
      }
    } else {
      setOpeningKey(e.key);
      setViewingSealed(true);
      setOpeningContent(null);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>時光膠囊</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>關閉</Text>
          </TouchableOpacity>
        </View>

        {openingKey ? (
          <View style={styles.body}>
            {viewingSealed ? (
              <View style={styles.locked}>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.lockText}>
                  {getDaysLeft(list.find((e) => e.key === openingKey)?.unlockAt ?? 0)} 天後可開啟
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.openContent}>
                <Text style={styles.contentText}>{openingContent}</Text>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.backToList} onPress={() => { setOpeningKey(null); setViewingSealed(false); }}>
              <Text style={styles.backText}>← 返回列表</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.body}>
            {ready.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>可開啟</Text>
                {ready.map((e) => (
                  <TouchableOpacity key={e.key} style={styles.capsuleRow} onPress={() => handleCapsuleClick(e)}>
                    <Text style={styles.capsuleLabel}>已可開啟</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity style={styles.writeBtn} onPress={() => setPastExpanded(false)}>
              <Text style={styles.writeBtnText}>寫一封給 30 天後的自己</Text>
            </TouchableOpacity>
            <View style={styles.writeArea}>
              <TextInput
                style={styles.input}
                placeholder="寫下想對未來的自己說的話..."
                placeholderTextColor={COLORS.muted}
                value={content}
                onChangeText={setContent}
                multiline
                editable={!sealing}
              />
              <TouchableOpacity
                style={[styles.sendBtn, sealing && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={sealing}
              >
                <Text style={styles.sendBtnText}>{sealing ? "封存中..." : "封存膠囊"}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.pastBtn} onPress={() => setPastExpanded(!pastExpanded)}>
              <Text style={styles.pastBtnText}>{pastExpanded ? "收起" : "查看所有膠囊"}</Text>
            </TouchableOpacity>
            {pastExpanded && allCapsules.map((e) => (
              <TouchableOpacity key={e.key} style={styles.capsuleRow} onPress={() => handleCapsuleClick(e)}>
                <Text style={styles.capsuleLabel}>
                  {e.opened ? "已開啟" : `封存中 · ${getDaysLeft(e.unlockAt)} 天後可開`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 18, fontWeight: "600", color: COLORS.amber },
  closeText: { fontSize: 14, color: COLORS.text },
  body: { flex: 1, padding: 16 },
  locked: { flex: 1, alignItems: "center", justifyContent: "center" },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  lockText: { fontSize: 16, color: COLORS.muted },
  openContent: { flex: 1 },
  contentText: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  backToList: { marginTop: 16 },
  backText: { fontSize: 14, color: COLORS.muted },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, color: COLORS.muted, marginBottom: 8 },
  capsuleRow: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 8 },
  capsuleLabel: { fontSize: 14, color: COLORS.text },
  writeBtn: { marginBottom: 12 },
  writeBtnText: { fontSize: 14, color: COLORS.amber },
  writeArea: { marginBottom: 16 },
  input: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, color: COLORS.text, minHeight: 120, textAlignVertical: "top", borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { marginTop: 12, backgroundColor: COLORS.amber, borderRadius: 20, padding: 14, alignItems: "center" },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.bg },
  pastBtn: { marginBottom: 8 },
  pastBtnText: { fontSize: 13, color: COLORS.muted },
});
