import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

// 1. FULL ICON (With Background, Rounded Squircle, Gold Border, Board, 3D Dice)
const fullIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>

    <!-- Quadrant Gradients -->
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff4365"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>

    <!-- Gold Accent Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>

    <!-- Dice 3D Gradients -->
    <linearGradient id="diceTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="diceFront" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="diceSide" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="dropShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Base Icon Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="502" height="502" x="5" y="5" rx="107" fill="none" stroke="url(#goldGrad)" stroke-width="4" opacity="0.65"/>

  <!-- Inner Board Frame -->
  <g filter="url(#dropShadow)">
    <rect x="76" y="76" width="360" height="360" rx="32" fill="#0b1120" stroke="#334155" stroke-width="6"/>
    
    <!-- Quadrant Blocks -->
    <!-- Red (Top-Left) -->
    <rect x="94" y="94" width="144" height="144" rx="18" fill="url(#redGrad)"/>
    <circle cx="166" cy="166" r="42" fill="#ffffff" opacity="0.95"/>
    <circle cx="166" cy="166" r="28" fill="#dc2626"/>
    <circle cx="166" cy="166" r="14" fill="#fee2e2"/>

    <!-- Green (Top-Right) -->
    <rect x="274" y="94" width="144" height="144" rx="18" fill="url(#greenGrad)"/>
    <circle cx="346" cy="166" r="42" fill="#ffffff" opacity="0.95"/>
    <circle cx="346" cy="166" r="28" fill="#059669"/>
    <circle cx="346" cy="166" r="14" fill="#d1fae5"/>

    <!-- Yellow (Bottom-Left) -->
    <rect x="94" y="274" width="144" height="144" rx="18" fill="url(#yellowGrad)"/>
    <circle cx="166" cy="346" r="42" fill="#ffffff" opacity="0.95"/>
    <circle cx="166" cy="346" r="28" fill="#d97706"/>
    <circle cx="166" cy="346" r="14" fill="#fef3c7"/>

    <!-- Blue (Bottom-Right) -->
    <rect x="274" y="274" width="144" height="144" rx="18" fill="url(#blueGrad)"/>
    <circle cx="346" cy="346" r="42" fill="#ffffff" opacity="0.95"/>
    <circle cx="346" cy="346" r="28" fill="#2563eb"/>
    <circle cx="346" cy="346" r="14" fill="#dbeafe"/>

    <!-- Central Diamond / Home Hub -->
    <polygon points="256,196 316,256 256,316 196,256" fill="#090d16" stroke="url(#goldGrad)" stroke-width="5"/>
  </g>

  <!-- Centered 3D Glossy Dice with 6 Pips & Gold Accents -->
  <g filter="url(#dropShadow)" transform="translate(256,256) scale(0.95) translate(-256,-256)">
    <!-- Dice Shadow -->
    <ellipse cx="256" cy="326" rx="72" ry="24" fill="#000000" opacity="0.55"/>

    <!-- 3D Isometric Cube Dice -->
    <!-- Top Face (Showing 1 Red Royal Star/Pip) -->
    <path d="M256,170 L336,215 L256,260 L176,215 Z" fill="url(#diceTop)" stroke="#cbd5e1" stroke-width="2"/>
    <circle cx="256" cy="215" r="12" fill="#dc2626"/>
    <circle cx="256" cy="215" r="5" fill="#fca5a5"/>

    <!-- Left Face (Showing 3 Pips) -->
    <path d="M176,215 L256,260 L256,335 L176,290 Z" fill="url(#diceFront)" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="204" cy="245" r="7" fill="#1e293b"/>
    <circle cx="216" cy="275" r="7" fill="#1e293b"/>
    <circle cx="228" cy="305" r="7" fill="#1e293b"/>

    <!-- Right Face (Showing 5 Pips) -->
    <path d="M256,260 L336,215 L336,290 L256,335 Z" fill="url(#diceSide)" stroke="#64748b" stroke-width="2"/>
    <circle cx="282" cy="272" r="7" fill="#0f172a"/>
    <circle cx="310" cy="248" r="7" fill="#0f172a"/>
    <circle cx="296" cy="296" r="7" fill="#0f172a"/>
    <circle cx="282" cy="318" r="7" fill="#0f172a"/>
    <circle cx="310" cy="294" r="7" fill="#0f172a"/>
  </g>

  <!-- Crown / Sparkle Accent above Dice -->
  <g transform="translate(256, 126)" filter="url(#softGlow)">
    <polygon points="0,-18 5,-5 18,0 5,5 0,18 -5,5 -18,0 -5,-5" fill="url(#goldGrad)"/>
  </g>
</svg>`;

// 2. ADAPTIVE FOREGROUND SVG (108x108 scale viewport with safe inner 72dp zone)
const adaptiveForegroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Quadrant Gradients -->
    <linearGradient id="afRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff4365"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <linearGradient id="afGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="afYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="afBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>

    <!-- Gold Accent Gradient -->
    <linearGradient id="afGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>

    <!-- Dice 3D Gradients -->
    <linearGradient id="afDiceTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="afDiceFront" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="afDiceSide" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="afDropShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <filter id="afSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Scaled into the center 68% Safe Zone so adaptive masks won't crop -->
  <g transform="translate(256,256) scale(0.72) translate(-256,-256)">
    <!-- Inner Board Frame -->
    <g filter="url(#afDropShadow)">
      <rect x="76" y="76" width="360" height="360" rx="32" fill="#0b1120" stroke="#334155" stroke-width="6"/>
      
      <!-- Quadrant Blocks -->
      <!-- Red (Top-Left) -->
      <rect x="94" y="94" width="144" height="144" rx="18" fill="url(#afRedGrad)"/>
      <circle cx="166" cy="166" r="42" fill="#ffffff" opacity="0.95"/>
      <circle cx="166" cy="166" r="28" fill="#dc2626"/>
      <circle cx="166" cy="166" r="14" fill="#fee2e2"/>

      <!-- Green (Top-Right) -->
      <rect x="274" y="94" width="144" height="144" rx="18" fill="url(#afGreenGrad)"/>
      <circle cx="346" cy="166" r="42" fill="#ffffff" opacity="0.95"/>
      <circle cx="346" cy="166" r="28" fill="#059669"/>
      <circle cx="346" cy="166" r="14" fill="#d1fae5"/>

      <!-- Yellow (Bottom-Left) -->
      <rect x="94" y="274" width="144" height="144" rx="18" fill="url(#afYellowGrad)"/>
      <circle cx="166" cy="346" r="42" fill="#ffffff" opacity="0.95"/>
      <circle cx="166" cy="346" r="28" fill="#d97706"/>
      <circle cx="166" cy="346" r="14" fill="#fef3c7"/>

      <!-- Blue (Bottom-Right) -->
      <rect x="274" y="274" width="144" height="144" rx="18" fill="url(#afBlueGrad)"/>
      <circle cx="346" cy="346" r="42" fill="#ffffff" opacity="0.95"/>
      <circle cx="346" cy="346" r="28" fill="#2563eb"/>
      <circle cx="346" cy="346" r="14" fill="#dbeafe"/>

      <!-- Central Diamond / Home Hub -->
      <polygon points="256,196 316,256 256,316 196,256" fill="#090d16" stroke="url(#afGoldGrad)" stroke-width="5"/>
    </g>

    <!-- Centered 3D Glossy Dice with 6 Pips & Gold Accents -->
    <g filter="url(#afDropShadow)" transform="translate(256,256) scale(0.95) translate(-256,-256)">
      <!-- Dice Shadow -->
      <ellipse cx="256" cy="326" rx="72" ry="24" fill="#000000" opacity="0.55"/>

      <!-- 3D Isometric Cube Dice -->
      <!-- Top Face (Showing 1 Red Royal Star/Pip) -->
      <path d="M256,170 L336,215 L256,260 L176,215 Z" fill="url(#afDiceTop)" stroke="#cbd5e1" stroke-width="2"/>
      <circle cx="256" cy="215" r="12" fill="#dc2626"/>
      <circle cx="256" cy="215" r="5" fill="#fca5a5"/>

      <!-- Left Face (Showing 3 Pips) -->
      <path d="M176,215 L256,260 L256,335 L176,290 Z" fill="url(#afDiceFront)" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="204" cy="245" r="7" fill="#1e293b"/>
      <circle cx="216" cy="275" r="7" fill="#1e293b"/>
      <circle cx="228" cy="305" r="7" fill="#1e293b"/>

      <!-- Right Face (Showing 5 Pips) -->
      <path d="M256,260 L336,215 L336,290 L256,335 Z" fill="url(#afDiceSide)" stroke="#64748b" stroke-width="2"/>
      <circle cx="282" cy="272" r="7" fill="#0f172a"/>
      <circle cx="310" cy="248" r="7" fill="#0f172a"/>
      <circle cx="296" cy="296" r="7" fill="#0f172a"/>
      <circle cx="282" cy="318" r="7" fill="#0f172a"/>
      <circle cx="310" cy="294" r="7" fill="#0f172a"/>
    </g>

    <!-- Crown / Sparkle Accent above Dice -->
    <g transform="translate(256, 126)" filter="url(#afSoftGlow)">
      <polygon points="0,-18 5,-5 18,0 5,5 0,18 -5,5 -18,0 -5,-5" fill="url(#afGoldGrad)"/>
    </g>
  </g>
</svg>`;

// 3. SPLASH SCREEN SVG (Full HD Dark Slate Canvas with Centered Ludo App Logo and "LUDO" Typography)
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <radialGradient id="splashBg" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="splashGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
  </defs>

  <!-- Dark Background -->
  <rect width="1080" height="1920" fill="url(#splashBg)" />

  <!-- Center Logo Emblem -->
  <g transform="translate(540, 850)">
    <!-- Embed the full icon centered -->
    <g transform="translate(-256, -256)">
      ${fullIconSvg.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">', '<g>').replace('</svg>', '</g>')}
    </g>
  </g>

  <!-- LUDO Typography -->
  <text x="540" y="1220" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="72" letter-spacing="12" fill="#ffffff">
    LUDO
  </text>
  <text x="540" y="1275" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="24" letter-spacing="6" fill="url(#splashGold)">
    CLASSIC BOARD GAME
  </text>
</svg>`;

const renderPng = (svg, width, height) => {
  const opts = height 
    ? { fitTo: { mode: 'height', value: height } }
    : { fitTo: { mode: 'width', value: width } };
  const resvg = new Resvg(svg, opts);
  return resvg.render().asPng();
};

const assetsDir = path.resolve('assets');
const publicDir = path.resolve('public');

if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// 1. Assets & Public Web Icons
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), fullIconSvg);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), renderPng(fullIconSvg, 1024));
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), renderPng(adaptiveForegroundSvg, 1024));
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), renderPng(fullIconSvg, 192));
fs.writeFileSync(path.join(assetsDir, 'splash.png'), renderPng(splashSvg, 1080));

fs.writeFileSync(path.join(publicDir, 'icon.svg'), fullIconSvg);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), fullIconSvg);
fs.writeFileSync(path.join(publicDir, 'icon.png'), renderPng(fullIconSvg, 512));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), renderPng(fullIconSvg, 192));

// 2. Android Native Resources
const resDir = path.resolve('android/app/src/main/res');
if (fs.existsSync(resDir)) {
  // Density Mipmap Icons & Adaptive Foregrounds
  const mipmaps = {
    'mipmap-mdpi': { full: 48, fg: 108 },
    'mipmap-hdpi': { full: 72, fg: 162 },
    'mipmap-xhdpi': { full: 96, fg: 216 },
    'mipmap-xxhdpi': { full: 144, fg: 324 },
    'mipmap-xxxhdpi': { full: 192, fg: 432 }
  };

  for (const [folder, sizes] of Object.entries(mipmaps)) {
    const dir = path.join(resDir, folder);
    if (fs.existsSync(dir)) {
      const fullPng = renderPng(fullIconSvg, sizes.full);
      const fgPng = renderPng(adaptiveForegroundSvg, sizes.fg);

      // Launcher full icon (legacy launchers & settings)
      fs.writeFileSync(path.join(dir, 'ic_launcher.png'), fullPng);
      fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), fullPng);

      // Adaptive Foreground icon (modern Android 8.0 - 15+ launchers)
      fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), fgPng);
    }
  }

  // Splash screens
  const splashDirs = [
    'drawable',
    'drawable-port-mdpi',
    'drawable-port-hdpi',
    'drawable-port-xhdpi',
    'drawable-port-xxhdpi',
    'drawable-port-xxxhdpi',
    'drawable-land-mdpi',
    'drawable-land-hdpi',
    'drawable-land-xhdpi',
    'drawable-land-xxhdpi',
    'drawable-land-xxxhdpi'
  ];

  const splashPng = renderPng(splashSvg, 1080);
  for (const folder of splashDirs) {
    const dir = path.join(resDir, folder);
    if (fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, 'splash.png'), splashPng);
    }
  }
}

console.log('✅ Generated all Android launcher icons (adaptive foregrounds + legacy mipmaps) & splash screens successfully!');
