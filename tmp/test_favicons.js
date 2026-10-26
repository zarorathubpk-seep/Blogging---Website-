import fs from 'fs';
import { execSync } from 'child_process';

// Let's create candidate SVGs and render them to PNGs at 16x16, 32x32, and 64x64 to verify clarity

// Option 1: Clean Hexagon with Bold Geometric "T-Crest" Symbol
// Primary: #F3B542 (Golden), Secondary: #0B1020 (Dark Navy)
const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Outer Hexagon Badge: Dark Navy #0B1020 with Gold #F3B542 Rim -->
  <path
    d="M32 5.5 L55 18.5 V45.5 L32 58.5 L9 45.5 V18.5 Z"
    fill="#0B1020"
    stroke="#F3B542"
    stroke-width="3"
    stroke-linejoin="round"
  />
  <!-- Inner Golden Crest: Bold Geometric T with Crest Apex -->
  <!-- Crossbar of T / Upper Crest -->
  <path
    d="M17 21 L32 14 L47 21 L47 27 L36 22 L36 44 L32 47 L28 44 L28 22 L17 27 Z"
    fill="#F3B542"
  />
  <!-- Lower Facet Accent (Subtle depth) -->
  <polygon points="32,49 24,43 32,38 40,43" fill="#F3B542" opacity="0.4" />
</svg>`;

// Option 2: Pure Minimalist Tech Hexagon with Bold "T" + "Crest" Monogram
// Ultra-sharp at 16x16 and 32x32:
// Hexagonal base with 4px border, and inside an unmistakable, iconic golden monogram
const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Navy Hexagon Base -->
  <path
    d="M32 4.5 L56 18.25 V45.75 L32 59.5 L8 45.75 V18.25 Z"
    fill="#0B1020"
    stroke="#F3B542"
    stroke-width="3.5"
    stroke-linejoin="round"
  />
  <!-- Top Crown Chevron (The "Crest") -->
  <path
    d="M32 14 L46 21 L46 27 L32 20 L18 27 L18 21 Z"
    fill="#F3B542"
  />
  <!-- Central Stem + Dynamic Diamond ("Tool" / "Apex") -->
  <path
    d="M28 25 L36 25 L36 38 L32 45 L28 38 Z"
    fill="#F3B542"
  />
  <!-- Side Precision Wings -->
  <polygon points="18,33 24,30 24,38 18,41" fill="#F3B542" opacity="0.85" />
  <polygon points="46,33 40,30 40,38 46,41" fill="#F3B542" opacity="0.85" />
</svg>`;

// Option 3: Modern Tech Brand Hexagon - Interlocking Isometric Geometric Crest
// Think Ethereum / HashiCorp / Polygon level simplicity:
// Bold golden T and flanking facets that form the crest inside the navy hexagon
const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Hexagon Container -->
  <path
    d="M32 4 L57 18.4 V45.6 L32 60 L7 45.6 V18.4 Z"
    fill="#0B1020"
    stroke="#F3B542"
    stroke-width="3.5"
    stroke-linejoin="round"
  />
  <!-- Bold Geometric 'T' & Crest Crown -->
  <!-- Crossbar -->
  <path
    d="M17 21 L32 13.5 L47 21 L44 26.5 L32 20.5 L20 26.5 Z"
    fill="#F3B542"
  />
  <!-- Center Stem -->
  <polygon
    points="28.5,22 35.5,22 35.5,41 32,46 28.5,41"
    fill="#F3B542"
  />
  <!-- Bottom Diamond Accent -->
  <polygon
    points="32,48 37,42 32,36 27,42"
    fill="#F3B542"
  />
</svg>`;

// Option 4: The Ultimate 16x16 / 32x32 Optimized Hexagon Icon
// Stripped of all fluff: A bold navy hexagon with an integrated golden chevron crest + tool apex
// Highest optical balance, instantly identifiable in a tab bar
const svg4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="50%" stop-color="#F3B542" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>

  <!-- Dark Navy Hexagon Shield with Rounded Vertices -->
  <path
    d="M32 4.5 L56.5 18.6 V45.4 L32 59.5 L7.5 45.4 V18.6 Z"
    fill="#0B1020"
    stroke="url(#goldGrad)"
    stroke-width="3.5"
    stroke-linejoin="round"
  />

  <!-- Top Crest Apex (Chevron) -->
  <path
    d="M32 14 L46 22 L41.5 25.5 L32 20 L22.5 25.5 L18 22 Z"
    fill="url(#goldGrad)"
  />

  <!-- Central T-Spire / Tool Core -->
  <path
    d="M29 23 H35 V38 L32 46 L29 38 Z"
    fill="url(#goldGrad)"
  />

  <!-- Flanking Geometric Facets (Precision cuts) -->
  <path
    d="M20 29 L26 26 V37 L20 40 Z"
    fill="#F3B542"
    opacity="0.85"
  />
  <path
    d="M44 29 L38 26 V37 L44 40 Z"
    fill="#F3B542"
    opacity="0.85"
  />
</svg>`;

// Option 5: Architectural Hexagon Monogram (T + C)
// The top and center form a powerful 'T', the outer hexagonal loop forms a stylized 'C'
const svg5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="gold5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0A0" />
      <stop offset="45%" stop-color="#F3B542" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>
  <!-- Dark Navy Hexagonal Base #0B1020 -->
  <path
    d="M32 5 L56 18.8 V45.2 L32 59 L8 45.2 V18.8 Z"
    fill="#0B1020"
    stroke="url(#gold5)"
    stroke-width="3"
    stroke-linejoin="round"
  />
  <!-- Modern Geometric Crest (Bold T & Crown) -->
  <path
    d="M17 21 L32 13 L47 21 L47 27 L35.5 21 V42 L32 47 L28.5 42 V21 L17 27 Z"
    fill="url(#gold5)"
  />
</svg>`;

fs.writeFileSync('/tmp/cand1.svg', svg1);
fs.writeFileSync('/tmp/cand2.svg', svg2);
fs.writeFileSync('/tmp/cand3.svg', svg3);
fs.writeFileSync('/tmp/cand4.svg', svg4);
fs.writeFileSync('/tmp/cand5.svg', svg5);

console.log('Candidates generated.');
