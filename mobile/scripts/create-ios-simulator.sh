#!/usr/bin/env bash
# Create an iOS Simulator device so Expo can launch it.
# Requires an iOS runtime (install via Xcode → Settings → Platforms).

set -e
DEVICE_NAME="${1:-iPhone 16}"
DEVICE_TYPE="com.apple.CoreSimulator.SimDeviceType.iPhone-16"

# Get first available iOS runtime
RUNTIME=$(xcrun simctl list runtimes -j 2>/dev/null | \
  grep -o '"com.apple.CoreSimulator.SimRuntime.iOS-[^"]*"' | head -1 | tr -d '"')

if [ -z "$RUNTIME" ]; then
  echo "No iOS simulator runtime found."
  echo "Install one via Xcode → Settings → Platforms → click + and add an iOS version."
  exit 1
fi

echo "Creating simulator: $DEVICE_NAME (runtime: $RUNTIME)"
UDID=$(xcrun simctl create "$DEVICE_NAME" "$DEVICE_TYPE" "$RUNTIME")
echo "Created device: $UDID"
echo "Booting simulator..."
xcrun simctl boot "$UDID" 2>/dev/null || true
open -a Simulator
echo "Simulator is starting. Then run: npm start && press i, or: npx expo start --ios"
