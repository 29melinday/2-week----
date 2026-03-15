"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface Resource {
  name: string;
  address: string;
  tel: string;
  lat: number;
  lng: number;
  note?: string;
}

// 台北市青少年／心理健康資源（含座標，依距離排序時使用）
const TAIPEI_RESOURCES: Resource[] = [
  { name: "台北市社區心理衛生中心", address: "台北市中正區金山南路1段5號", tel: "02-3393-6779", lat: 25.0392, lng: 121.5262 },
  { name: "張老師基金會台北中心", address: "台北市大安區敦化南路二段63巷40號", tel: "1980", lat: 25.0260, lng: 121.5436 },
  { name: "生命線協談專線", address: "24小時全國", tel: "1995", lat: 25.0330, lng: 121.5654 },
  { name: "衛福部安心專線", address: "24小時", tel: "1925", lat: 25.04, lng: 121.55 },
  { name: "台北市立聯合醫院松德院區", address: "台北市信義區松德路309號", tel: "02-2726-3141", lat: 25.0312, lng: 121.5756 },
  { name: "台大醫院精神醫學部", address: "台北市中正區中山南路7號", tel: "02-2312-3456", lat: 25.0395, lng: 121.5172 },
  { name: "馬偕紀念醫院精神科", address: "台北市中山區中山北路二段92號", tel: "02-2543-3535", lat: 25.0526, lng: 121.5226 },
  { name: "台北市青少年發展處", address: "台北市中正區仁愛路1段17號", tel: "02-2351-4078", lat: 25.0374, lng: 121.5242 },
  { name: "勵馨基金會台北蒲公英諮商中心", address: "台北市大安區羅斯福路二段75號7樓", tel: "02-2367-9595", lat: 25.0282, lng: 121.5228 },
  { name: "台北市婦女救援基金會", address: "台北市中正區重慶南路1段43號8樓", tel: "02-2555-8595", lat: 25.0442, lng: 121.5118 },
  { name: "董氏基金會心理衛生組", address: "台北市松山區民生東路四段133號6樓", tel: "02-2776-6133", lat: 25.0568, lng: 121.5532 },
  { name: "台北市學生輔導諮商中心", address: "台北市中正區南海路45號", tel: "02-2341-4151", lat: 25.0318, lng: 121.5124 },
  { name: "松山區健康服務中心", address: "台北市松山區八德路4段692號", tel: "02-2767-1755", lat: 25.0542, lng: 121.5628 },
  { name: "大安區健康服務中心", address: "台北市大安區辛亥路3段15號", tel: "02-2733-5831", lat: 25.0204, lng: 121.5342 },
  { name: "萬華區健康服務中心", address: "台北市萬華區東園街152號", tel: "02-2303-3092", lat: 25.0242, lng: 121.4986 },
  { name: "士林區健康服務中心", address: "台北市士林區中正路439號", tel: "02-2881-3039", lat: 25.0942, lng: 121.5228 },
  { name: "北投區健康服務中心", address: "台北市北投區新市街30號3樓", tel: "02-2893-8605", lat: 25.1328, lng: 121.5028 },
  { name: "內湖區健康服務中心", address: "台北市內湖區民權東路6段99號", tel: "02-2791-1169", lat: 25.0658, lng: 121.5892 },
  { name: "陽光社會福利基金會", address: "台北市南京東路三段91號3樓", tel: "02-2507-8006", lat: 25.0502, lng: 121.5418 },
  { name: "中華民國自殺防治協會", address: "台北市中山區松江路65號11樓", tel: "02-2506-2826", lat: 25.0506, lng: 121.5322 },
];

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
    if (!navigator.geolocation) {
      setLocationError("此瀏覽器不支援定位");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationError("無法取得位置，將依預設順序顯示");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [visible]);

  const sortedResources = useMemo(() => {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-twilight-bg flex flex-col"
    >
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <h2 className="text-lg text-twilight-amber font-semibold">資源地圖</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-3xl px-4 py-2 text-twilight-text border border-white/20 bg-white/10 hover:bg-white/20 text-sm font-normal transition-colors"
        >
          關閉
        </button>
      </header>
      <div className="px-4 py-2 text-sm text-twilight-muted shrink-0">
        {locationLoading && "正在取得您的位置，將依距離由近到遠排序…"}
        {locationError && locationError}
        {userLocation && !locationLoading && "已依與您的距離排序（最近優先）"}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedResources.map((r, i) => (
          <motion.div
            key={`${r.name}-${r.tel}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4"
            whileTap={{ scale: 0.98 }}
          >
            {userLocation && (
              <p className="text-xs text-twilight-muted mb-1">
                約 {haversineKm(userLocation.lat, userLocation.lng, r.lat, r.lng).toFixed(1)} 公里
              </p>
            )}
            <h3 className="text-twilight-text font-semibold">{r.name}</h3>
            <p className="text-sm text-twilight-muted mt-1 font-normal">{r.address}</p>
            <p className="text-sm text-twilight-amber mt-1 font-normal">電話：{r.tel}</p>
            {r.note && <p className="text-xs text-twilight-muted mt-1">{r.note}</p>}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address + " " + r.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 rounded-3xl px-3 py-2 text-sm text-twilight-text border border-white/20 bg-white/10 hover:bg-white/20 font-normal transition-colors"
            >
              一鍵導航
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
