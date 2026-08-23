# 📱 Remix Ludo Game - Android & Expo Setup Guide

This guide explains how to run the app in **Expo Go** on your Android device and how to automatically generate and release **Android APKs** using **GitHub Actions**.

---

## 🚀 1. Running on Android via Expo Go

You can test and run the game directly on your Android phone using Expo:

### Steps:
1. **Install Expo Go** on your Android phone from Google Play Store.
2. In your project directory on your computer/terminal, run:
   ```bash
   npx expo start
   ```
   *(Or run `npx expo start --tunnel` if your phone is on a different Wi-Fi network).*
3. Open the **Expo Go** app on your Android phone, tap **Scan QR code**, and scan the QR code shown in your terminal.
4. The game will immediately load with full touch support and smooth animations!

---

## 📦 2. Automated GitHub Actions APK Release (`.yml` workflow)

The project includes pre-configured GitHub Actions workflows located in `.github/workflows/`:
- **`build-apk.yml`**: Builds the Android APK and publishes it to **GitHub Releases** and **GitHub Artifacts**.
- **`eas-build-apk.yml`**: Builds the APK directly via Expo Cloud (EAS Build).

### How to trigger an APK build & release on GitHub:

#### Method A: Manual Trigger (1-Click)
1. Push this repository to GitHub.
2. On GitHub, navigate to the **Actions** tab.
3. Select **"Build & Release Android APK"** from the left sidebar.
4. Click **Run workflow** (choose version tag, e.g., `v1.0.0`), then click the green **Run workflow** button.
5. Once completed:
   - Find your ready-to-install `.apk` file under **Releases** on your GitHub repo page.
   - Or download it from the **Artifacts** section of the Action run.

#### Method B: Push a Git Tag (Automated Release)
Simply create and push a release tag from your terminal:
```bash
git tag v1.0.0
git push origin v1.0.0
```
GitHub Actions will automatically build the APK and publish a new GitHub Release with the APK attached.

---

## 🛠️ 3. Direct Local / EAS Cloud APK Build

If you want to build an APK using Expo EAS:

1. Log into your Expo account:
   ```bash
   npx eas login
   ```
2. Build an installable standalone APK for Android:
   ```bash
   npx eas build -p android --profile preview
   ```
3. EAS will provide a direct download link and QR code to download and install the APK on your phone.

---

## ⚙️ Configuration Files Added:
- **`app.json`**: Expo application configuration (package `com.ludoremix.app`, orientation, permissions, splash & adaptive icons).
- **`eas.json`**: EAS Build profiles configured for standalone APK generation (`buildType: "apk"`).
- **`.github/workflows/build-apk.yml`**: GitHub Actions CI/CD workflow that compiles the Android APK and publishes GitHub Releases.
- **`.github/workflows/eas-build-apk.yml`**: GitHub Actions EAS workflow for Expo Cloud.
