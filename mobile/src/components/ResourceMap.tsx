import React, { useState, useEffect, useMemo } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from "react-native";
import * as Location from "expo-location";
import { TAIPEI_RESOURCES, haversineKm } from "../lib/resources";
import { COLORS } from "../lib/constants";

interface ResourceMapProps {
  visible: boolean;
  onClose: () => void;
}

export default function ResourceMap({ visible, onClose }: ResourceMapProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setLocationLoading(true);
    setLocationError(null);
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("未取得定位權限，將依預設順序顯示");
          setLocationLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch {
        setLocationError("無法取得位置");
      }
      setLocationLoading(false);
    })();
  }, [visible]);

  const sorted = useMemo(() => {
    const list = [...TAIPEI_RESOURCES];
    if (!userLocation) return list;
    list.sort((a, b) => {
      const da = haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const db = haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return da - db;
    });
    return list;
  }, [userLocation]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>資源地圖</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>關閉</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          {locationLoading && "正在取得位置…"}
          {locationError && locationError}
          {userLocation && !locationLoading && "已依距離排序（最近優先）"}
        </Text>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {sorted.map((r) => (
            <View key={r.name + r.tel} style={styles.card}>
              {userLocation && (
                <Text style={styles.distance}>
                  約 {haversineKm(userLocation.lat, userLocation.lng, r.lat, r.lng).toFixed(1)} 公里
                </Text>
              )}
              <Text style={styles.name}>{r.name}</Text>
              <Text style={styles.address}>{r.address}</Text>
              <Text style={styles.tel}>電話：{r.tel}</Text>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address + " " + r.name)}`)}
              >
                <Text style={styles.navBtnText}>一鍵導航</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  hint: { fontSize: 12, color: COLORS.muted, paddingHorizontal: 16, paddingVertical: 8 },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  distance: { fontSize: 12, color: COLORS.muted, marginBottom: 4 },
  name: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  address: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  tel: { fontSize: 13, color: COLORS.amber, marginTop: 4 },
  navBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.card, borderRadius: 20, alignSelf: "flex-start", borderWidth: 1, borderColor: COLORS.border },
  navBtnText: { fontSize: 13, color: COLORS.text },
});
