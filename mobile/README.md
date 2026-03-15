# 行善台北 (Kindness Taipei) — Mobile

React Native (Expo) 版本，供手機使用。

## 執行方式

```bash
cd mobile
npm install
npx expo start
```

- 用 Expo Go App 掃描 QR code（Android / iOS）
- 或按 `a` 開 Android 模擬器、`i` 開 iOS 模擬器

## 環境變數（選填）

在專案根目錄建立 `.env`（或 `mobile/.env`）：

- `EXPO_PUBLIC_API_BASE`：後端 API 網址（例如部署好的 Next.js：`https://your-app.vercel.app`）
  - 未設定時：聊天會回覆預設文案，公車為假資料

## 資源檔

若缺少 `assets/icon.png`、`assets/splash.png`、`assets/adaptive-icon.png`，可從 [Expo 預設模板](https://github.com/expo/expo/tree/main/templates/expo-template-blank) 複製 `assets` 資料夾，或自行準備圖檔。

## 功能對應

- **公車畫面**：長按「更新時間：1分鐘前」約 3 秒 → 進入計算機
- **計算機**：輸入設定中的進入密碼（預設 `110#`）→ 進入小曉
- **小曉**：聊天、心情河流、呼吸練習、時光膠囊、資源地圖、我的紀錄、設定
- **資源地圖**：會請求定位權限，依距離排序台北心理資源

後端（聊天 API）需另行部署目前的 Next.js 專案，並將網址設為 `EXPO_PUBLIC_API_BASE`。
