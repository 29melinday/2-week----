# 行善台北 (Kindness Taipei) — Mobile

React Native (Expo) 版本，支援 **iOS** 與 **Android**。

## 執行方式（Expo Go）

```bash
cd mobile
npm install
npm start
```

- 用 Expo Go App 掃描 QR code（Android / iOS）
- 或按 `a` 開 Android 模擬器、`i` 開 iOS 模擬器

### 建立 iOS 模擬器（首次或「No iOS devices available」時）

1. **安裝 iOS 模擬器 runtime**  
   開啟 Xcode → **Settings** (或 **Xcode → Preferences**) → **Platforms** → 點 **+** → 選擇一個 **iOS** 版本下載。

2. **建立並開啟模擬器**（在 `mobile` 目錄下）：
   ```bash
   npm run simulator:create
   ```
   會建立一支 iPhone 16 模擬器並開啟 Simulator.app。若要指定名稱可傳參數：`bash scripts/create-ios-simulator.sh "My iPhone"`。

3. **啟動專案並在 iOS 模擬器執行**：
   ```bash
   npm start
   ```
   在終端按 **i**，或另開終端執行 `npx expo start --ios`，Expo 會把 App 裝到已開啟的模擬器。

僅開啟 Simulator 而不建立新裝置：`npm run simulator:open`。

## 建置 iOS 與 Android 原生 App

### 方式一：本地產生原生專案（prebuild）

產生 `ios/` 與 `android/` 後，可用 Xcode / Android Studio 建置或直接跑模擬器：

```bash
cd mobile
npm install
npm run prebuild
```

- **iOS**：需先安裝 **完整 Xcode** 與 CocoaPods，再執行 `pod install` 與建置：
  1. **安裝完整 Xcode（必備）**  
     若出現 `SDK "iphoneos" cannot be located` 或 `active developer directory ... CommandLineTools`，代表目前只有「Command Line Tools」，沒有完整 Xcode：
     - 從 **App Store** 安裝 **Xcode**（免費，體積大，需一些時間）。
     - 安裝完成後，在終端執行以下指令，讓系統使用 Xcode 內建的 iOS SDK：
       ```bash
       sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
       ```
     - 第一次開啟 Xcode 時，若提示安裝額外元件，請同意安裝。
  2. **安裝 Homebrew**（若尚未安裝）：在終端機貼上並執行：
     ```bash
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```
     依畫面提示按 Enter、輸入本機密碼。裝完後依指示把 Homebrew 加入 PATH（例如執行 `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile && eval "$(/opt/homebrew/bin/brew shellenv)"`）。
  3. **安裝 CocoaPods**（擇一）：
     - **Homebrew（建議）**：`brew install cocoapods`（較快，不會像 `bundle install` 卡住）
     - 或 Ruby：`sudo gem install cocoapods`  
     若用 Bundler：`cd ios && bundle install`（若卡住可改用 Homebrew）
  4. 安裝 iOS 依賴並執行：
  ```bash
  npm run pod:install
  npx expo run:ios
  ```
  或於 Xcode 開啟 `ios/app.xcworkspace`（請開 `.xcworkspace`，不要開 `.xcodeproj`）建置。
- **Android**：`npx expo run:android` 或於 Android Studio 開啟 `android/` 建置

若要重新產生原生專案（例如改過 app.json 的 native 設定）：

```bash
npm run prebuild:clean
```

### 方式二：EAS Build（雲端建置）

不需安裝 Xcode / Android Studio，由 Expo 雲端建置 .ipa / .apk 或 .aab：

1. 安裝 EAS CLI 並登入：`npm i -g eas-cli` 後執行 `eas login`
2. 在專案中設定 EAS：`eas build:configure`（若尚未設定）
3. 建置：
   - **iOS**：`npm run build:ios` 或 `eas build --platform ios --profile production`
   - **Android (AAB)**：`npm run build:android`
   - **Android (APK，方便內部分發)**：`npm run build:android:apk`

建置完成後可從 Expo 網頁下載安裝檔，或接續使用 `eas submit` 上架。

## 環境變數（選填）

在專案根目錄建立 `.env`（或 `mobile/.env`）：

- `EXPO_PUBLIC_API_BASE`：後端 API 網址（例如部署好的 Next.js：`https://your-app.vercel.app`）
  - 未設定時：聊天會回覆預設文案，公車為假資料

## 資源檔

若缺少 `assets/icon.png`、`assets/splash.png`、`assets/adaptive-icon.png`，可從 [Expo 預設模板](https://github.com/expo/expo/tree/main/templates/expo-template-blank) 複製 `assets` 資料夾，或自行準備圖檔。prebuild 前建議至少準備 icon，否則會使用預設圖。

## 功能對應

- **公車畫面**：長按「更新時間：1分鐘前」約 3 秒 → 進入計算機
- **計算機**：輸入設定中的進入密碼（預設 `110#`）→ 進入小曉
- **小曉**：聊天、心情河流、呼吸練習、時光膠囊、資源地圖、我的紀錄、設定
- **資源地圖**：會請求定位權限，依距離排序台北心理資源

後端（聊天 API）需另行部署目前的 Next.js 專案，並將網址設為 `EXPO_PUBLIC_API_BASE`。
