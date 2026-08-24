# 📱 Remix Ludo Game - Android APK & GitHub Actions Release

This repository is configured to build and release a standalone, installable **Android APK (`.apk`)** using **GitHub Actions** and **Capacitor Android Toolchain**.

---

## 🚀 How to Get Your Android APK from GitHub

### Method A: 1-Click Trigger from GitHub Actions
1. Push your repository code to GitHub.
2. Go to your repository on GitHub and click the **Actions** tab.
3. In the left sidebar, click **"Build & Release Android APK"**.
4. Click **Run workflow** -> Click the green **Run workflow** button.
5. Once the run finishes (~2 minutes):
   - Navigate to the **Releases** section on your repository homepage to download `RemixLudoGame.apk`.
   - Or download `RemixLudoGame-Android-APK` from the **Artifacts** section at the bottom of the Action run page.

### Method B: Push a Git Tag (Automated Release)
Create and push a release tag from your local terminal:
```bash
git tag v1.0.0
git push origin v1.0.0
```
GitHub Actions will compile the Android APK and automatically create a new GitHub Release with `RemixLudoGame.apk` attached.

---

## 📲 Installing on Your Android Device
1. Transfer or download `RemixLudoGame.apk` on your Android phone/tablet.
2. Tap the `.apk` file to install.
3. If Android shows a prompt, allow *"Install from this source / Install unknown apps"*.
4. Open **Remix Ludo Game** and play!

---

## 🛠️ Configuration Files:
- **`capacitor.config.json`**: Android wrapper configuration with App ID `com.ludoremix.app` and web root `dist`.
- **`.github/workflows/build-apk.yml`**: Automates JDK 17, Android SDK, web build, Capacitor sync, Gradle compilation (`./gradlew assembleDebug`), and GitHub Releases publication.
