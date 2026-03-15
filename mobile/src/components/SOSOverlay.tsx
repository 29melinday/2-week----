import React from "react";
import { Modal, View, Text, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { COLORS } from "../lib/constants";

interface SOSOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function SOSOverlay({ visible, onDismiss }: SOSOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>需要時，請聯繫</Text>
          <Text style={styles.subtitle}>安心專線 24 小時</Text>
          <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL("tel:1925")}>
            <Text style={styles.btnText}>1925</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>生命線 24 小時</Text>
          <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL("tel:1995")}>
            <Text style={styles.btnText}>1995</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismiss} onPress={onDismiss}>
            <Text style={styles.dismissText}>我知道了</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 24 },
  card: { backgroundColor: COLORS.sos, borderRadius: 24, padding: 24, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "600", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 16 },
  btn: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16 },
  btnText: { fontSize: 18, fontWeight: "600", color: "#fff" },
  dismiss: { marginTop: 24 },
  dismissText: { fontSize: 14, color: "rgba(255,255,255,0.9)" },
});
