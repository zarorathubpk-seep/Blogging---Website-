import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Resvg } from '@resvg/resvg-js';

// Clean, geometric hexagon-shaped favicon for ToolCrest
// Primary: #F3B542 (Golden)
// Secondary: #0B1020 (Dark Navy)
// Transparent background outside the hexagon
// Minimal, sharp, and visually balanced for 16x16 and 32x32 pixels
const SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <!-- Ultra-sharp 24K Liquid Gold Gradient -->
    <linearGradient id="tcFavGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE382" />
      <stop offset="50%" stop-color="#F3B542" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- Deep Titanium Dark Navy Gradient -->
    <linearGradient id="tcFavNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111827" />
      <stop offset="60%" stop-color="#0B1020" />
      <stop offset="100%" stop-color="#070A14" />
    </linearGradient>
  </defs>

  <!-- Clean Geometric Hexagon Base with Golden Border -->
  <path
    d="M32 4.5 L56.5 18.6 V45.4 L32 59.5 L7.5 45.4 V18.6 Z"
    fill="url(#tcFavNavy)"
    stroke="url(#tcFavGold)"
    stroke-width="3.5"
    stroke-linejoin="round"
  />

  <!-- Bold Central Crest & Tool Monogram ('T') -->
  <!-- Upper Crest Crown & Crossbar -->
  <path
    d="M17 21.5 L32 13 L47 21.5 L47 28.5 L36 22.5 V42.5 L32 48.5 L28 42.5 V22.5 L17 28.5 Z"
    fill="url(#tcFavGold)"
  />

  <!-- Diamond Precision Core -->
  <polygon
    points="32,24.5 35.5,29 32,33.5 28.5,29"
    fill="#0B1020"
  />
</svg>
`;

async function buildFavicons() {
  const publicDir = path.resolve('public');
  const svgPath = path.join(publicDir, 'favicon.svg');

  // 1. Write the vector SVG favicon
  fs.writeFileSync(svgPath, SVG_CONTENT.trim(), 'utf-8');
  console.log(`[Favicon] Wrote ${svgPath}`);

  // 2. Generate PNGs across required sizes
  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
  ];

  for (const { size, name } of sizes) {
    const resvg = new Resvg(SVG_CONTENT, {
      fitTo: {
        mode: 'width',
        value: size,
      },
      shapeRendering: 2, // geometricPrecision
      textRendering: 1,  // geometricPrecision
      imageRendering: 0, // optimizeQuality
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    const targetPath = path.join(publicDir, name);
    fs.writeFileSync(targetPath, pngBuffer);
    console.log(`[Favicon] Rendered ${name} (${size}x${size})`);
  }

  // 3. Assemble multi-resolution ICO (16x16, 32x32, 48x48)
  const p16 = path.join(publicDir, 'favicon-16x16.png');
  const p32 = path.join(publicDir, 'favicon-32x32.png');
  const p48 = path.join(publicDir, 'favicon-48x48.png');
  const icoPath = path.join(publicDir, 'favicon.ico');

  try {
    execSync(`convert "${p16}" "${p32}" "${p48}" "${icoPath}"`, { stdio: 'inherit' });
    console.log(`[Favicon] Assembled multi-resolution ${icoPath}`);
  } catch (err) {
    console.error('Failed to convert ICO with ImageMagick, writing 32x32 as fallback', err);
    fs.copyFileSync(p32, icoPath);
  }

  console.log('[Favicon] All favicon formats successfully generated!');
}

buildFavicons().catch((err) => {
  console.error(err);
  process.exit(1);
});
