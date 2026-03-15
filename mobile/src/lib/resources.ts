export interface Resource {
  name: string;
  address: string;
  tel: string;
  lat: number;
  lng: number;
}

export const TAIPEI_RESOURCES: Resource[] = [
  { name: "台北市社區心理衛生中心", address: "台北市中正區金山南路1段5號", tel: "02-3393-6779", lat: 25.0392, lng: 121.5262 },
  { name: "張老師基金會台北中心", address: "台北市大安區敦化南路二段63巷40號", tel: "1980", lat: 25.0260, lng: 121.5436 },
  { name: "生命線協談專線", address: "24小時全國", tel: "1995", lat: 25.0330, lng: 121.5654 },
  { name: "衛福部安心專線", address: "24小時", tel: "1925", lat: 25.04, lng: 121.55 },
  { name: "台北市立聯合醫院松德院區", address: "台北市信義區松德路309號", tel: "02-2726-3141", lat: 25.0312, lng: 121.5756 },
  { name: "台大醫院精神醫學部", address: "台北市中正區中山南路7號", tel: "02-2312-3456", lat: 25.0395, lng: 121.5172 },
  { name: "馬偕紀念醫院精神科", address: "台北市中山區中山北路二段92號", tel: "02-2543-3535", lat: 25.0526, lng: 121.5226 },
  { name: "台北市青少年發展處", address: "台北市中正區仁愛路1段17號", tel: "02-2351-4078", lat: 25.0374, lng: 121.5242 },
  { name: "勵馨基金會台北蒲公英諮商中心", address: "台北市大安區羅斯福路二段75號7樓", tel: "02-2367-9595", lat: 25.0282, lng: 121.5228 },
  { name: "董氏基金會心理衛生組", address: "台北市松山區民生東路四段133號6樓", tel: "02-2776-6133", lat: 25.0568, lng: 121.5532 },
  { name: "台北市學生輔導諮商中心", address: "台北市中正區南海路45號", tel: "02-2341-4151", lat: 25.0318, lng: 121.5124 },
  { name: "中華民國自殺防治協會", address: "台北市中山區松江路65號11樓", tel: "02-2506-2826", lat: 25.0506, lng: 121.5322 },
];

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
