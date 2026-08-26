import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </radialGradient>

    <!-- Quadrant Gradients -->
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff4b68"/>
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
      <stop offset="100%" stop-color="#f1f5f9"/>
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
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Base Icon Squircle Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="url(#goldGrad)" stroke-width="4" opacity="0.6"/>

  <!-- Inner Board Frame -->
  <g filter="url(#dropShadow)">
    <rect x="76" y="76" width="360" height="360" rx="36" fill="#0f172a" stroke="#334155" stroke-width="6"/>
    
    <!-- Quadrant Blocks -->
    <!-- Red (Top-Left) -->
    <rect x="94" y="94" width="144" height="144" rx="20" fill="url(#redGrad)"/>
    <circle cx="166" cy="166" r="42" fill="#ffffff" opacity="0.95"/>
    <circle cx="166" cy="166" r="28" fill="#dc2626"/>
    <circle cx="166" cy="166" r="14" fill="#fee2e2"/>

    <!-- Green (Top-Right) -->
    <rect x="274" y="94" width="144" height="144" rx="20" fill="url(#greenGrad)"/>
    <circle cx="346" cy="166" r="42" fill="#ffffff" opacity="0.95"/>
    <circle cx="346" cy="166" r="28" fill="#059669"/>
    <circle cx="346" cy="166" r="14" fill="#d1fae5"/>

    <!-- Yellow (Bottom-Left) -->
    <rect x="94" y="274" width="144" height="144" rx="20" fill="url(#yellowGrad)"/>
    <circle cx="166" cy="346" r="42" fill="#ffffff" opacity="0.95"/>
    <circle cx="166" cy="346" r="28" fill="#d97706"/>
    <circle cx="166" cy="346" r="14" fill="#fef3c7"/>

    <!-- Blue (Bottom-Right) -->
    <rect x="274" y="274" width="144" height="144" rx="20" fill="url(#blueGrad)"/>
    <circle cx="346" cy="346" r="42" fill="#ffffff" opacity="0.95"/>
    <circle cx="346" cy="346" r="28" fill="#2563eb"/>
    <circle cx="346" cy="346" r="14" fill="#dbeafe"/>

    <!-- Central Diamond / Home Hub -->
    <polygon points="256,196 316,256 256,316 196,256" fill="#090d16" stroke="url(#goldGrad)" stroke-width="6"/>
  </g>

  <!-- Centered 3D Glossy Dice with 6 Pips & Gold Accents -->
  <g filter="url(#dropShadow)" transform="translate(256,256) scale(0.95) translate(-256,-256)">
    <!-- Dice Shadow -->
    <ellipse cx="256" cy="326" rx="72" ry="24" fill="#000000" opacity="0.5"/>

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

const renderPng = (svg, width) => {
  const opts = { fitTo: { mode: 'width', value: width } };
  const resvg = new Resvg(svg, opts);
  return resvg.render().asPng();
};

const assetsDir = path.resolve('assets');
const publicDir = path.resolve('public');

if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// Render SVGs
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), svgIcon);
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon);

// Render PNGs
fs.writeFileSync(path.join(assetsDir, 'icon.png'), renderPng(svgIcon, 1024));
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), renderPng(svgIcon, 1024));
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), renderPng(svgIcon, 192));
fs.writeFileSync(path.join(publicDir, 'icon.png'), renderPng(svgIcon, 512));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), renderPng(svgIcon, 192));

// Android Mipmap icons
const resDir = path.resolve('android/app/src/main/res');
if (fs.existsSync(resDir)) {
  const sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
  };
  for (const [folder, size] of Object.entries(sizes)) {
    const dir = path.join(resDir, folder);
    if (fs.existsSync(dir)) {
      const pngBuffer = renderPng(svgIcon, size);
      fs.writeFileSync(path.join(dir, 'ic_launcher.png'), pngBuffer);
      fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), pngBuffer);
    }
  }
}

console.log('All Ludo app icons successfully rendered in SVG and PNG format across all densities.');
