<div align="center">

# 🍃 KOMOREBI STUDIO
### Anime Wallpaper Lab, Neural Line Forge & Lockscreen Showcase

[![React 18](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Canvas GPU](https://img.shields.io/badge/Engine-Client--Side_GPU-00F0FF?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)
[![Author: sm000ky](https://img.shields.io/badge/Author-sm000ky-FF3366?style=for-the-badge&logo=github)](https://github.com/sm000ky)

<p align="center">
  <b>A high-performance creative studio for anime wallpapers, color harmony extraction, and lockscreen framing. Zero CPU thermal throttling, zero app-crashes, 100% client-side precision.</b>
</p>

```
  木漏れ日 // KOMOREBI STUDIO v2.5
  ======================================================
  ● ENGINE: CLIENT_GPU  •  RATIO: 20:9  •  DPI: 4K ULTRA
  [STATUS] 30 PRESETS ACTIVE • NEURAL RECONSTRUCT READY
  ======================================================
```

</div>

---

## 🌟 What is Komorebi?

*Komorebi* (木漏れ日) is the Japanese expression for sunlight filtering through the canopy of trees. 

**Komorebi Studio** brings that tranquil yet vibrant aesthetic to your device screens. It empowers anime enthusiasts and digital artists to frame, color-grade, upscale, and inspect lockscreen wallpapers with real-time UI collision detection and zero pixel loss.

## ✨ Highlight Features

### 1. 🛡️ True Edge-Coverage & D-Pad Micro-Nudge
- **No More Black Empty Bars:** Mathematical edge clamping ensures full artwork coverage without awkward letterboxing or black gaps.
- **5-Way Precision D-Pad:** Fine-tune artwork alignment pixel-by-pixel (`▲`, `◄`, `RESET`, `►`, `▼`) alongside dual horizontal & vertical pan sliders.
- **Full Art (Blur Fill) Mode:** Keep 100% of wide landscape anime stills uncropped, bordered by an ambient color-matched Gaussian backdrop.

### 2. ⚡ Client-Side Neural Reconstruct 4K
- **Zero-LMK / Zero Crash:** Built specifically to eliminate heavy tensor spikes that trigger Android Low Memory Killer crashes.
- **Multi-Pass Edge Restoration:** Enhances anime lineart contrast, eliminates JPEG compression halos, and scales output to 4K density directly via browser GPU shaders.

### 3. 📱 Lockscreen HUD Simulator & Collision Guard
- **Avoid Face Obstructions:** A visual danger-zone boundary highlights where the lockscreen clock and camera cutout sit so character faces never get covered.
- **Dynamic Island & Widget Audio:** Interactive Dynamic Island pill with animated soundwave visualizer.

### 4. 🎨 Palette Forge & Material You Export
- **Dynamic 5-Color Extraction:** Instantly extracts dominant color harmonies with relative luminance scoring.
- **One-Click Export:** Copy directly as HEX list, Tailwind CSS config, or Android XML palette.

### 5. 🎴 Anime Watermark Kanji Stamps & 11 Tones
- **Studio Typography:** Toggle authentic kanji stamps (`零二 // 002`, `東京 // 2026`, `雨 // CHILL`, `新世紀 // EVA`).
- **Atmospheric Filters:** 90s Cel-Anime, Cyber Neon, Lo-Fi Chill, Tokyo Midnight, Sakura Petals, Emerald Ghibli, and OLED Midnight.

### 6. 📁 Curated 30-Preset Catalog
- Preloaded with 30 high-resolution artworks categorized across **Ghibli**, **Cyber**, **Lo-Fi**, **Scenery**, and **Retro**.

## 🛠️ Tech Architecture

- **Frontend:** React 18 + Vite 5
- **Styling:** Tailwind CSS + Custom Cyber-Grid Backdrop
- **Rendering:** HTML5 Offscreen Canvas 2D + Web Audio Synthesizer
- **Export Formats:** 1080x2400 (Mobile), 3840x2160 (Desktop 4K), and Showcase Mockup Cards with device bezels

## 🏁 Quickstart

```bash
# Clone the repository
git clone https://github.com/sm000ky/komorebi-studio.git

# Enter project directory
cd komorebi-studio

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173` on desktop or mobile.

## 👤 Author

Architected & crafted with care by **sm000ky** ([@sm000ky](https://github.com/sm000ky)).

---

<div align="center">
  <sub>Inspired by retro anime nostalgia, modern cyberpunk interfaces, and the pursuit of crisp visuals.</sub>
</div>
