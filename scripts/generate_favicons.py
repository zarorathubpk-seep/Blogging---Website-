#!/usr/bin/env python3
"""
ToolCrest Favicon Suite Generator
Generates high-precision, multi-resolution favicons:
- public/favicon.svg (Scalable vector with dark navy #0B1020 & golden #F3B542)
- public/favicon-16x16.png
- public/favicon-32x32.png
- public/favicon-48x48.png
- public/apple-touch-icon.png (180x180)
- public/android-chrome-192x192.png
- public/android-chrome-512x512.png
- public/favicon.ico (Multi-size ICO with 16, 32, 48px)
"""

import os
import subprocess

# Optimized 64x64 SVG Favicon
# Primary: #F3B542 (Golden)
# Secondary: #0B1020 (Dark Navy)
# Designed specifically for razor-sharp legibility at 16x16 and 32x32 browser tab sizes
SVG_CONTENT = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <!-- Premium 24K Liquid Gold Gradient -->
    <linearGradient id="tcGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE58F" />
      <stop offset="45%" stop-color="#F3B542" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- Deep Titanium Navy Gradient -->
    <linearGradient id="tcNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141D33" />
      <stop offset="60%" stop-color="#0B1020" />
      <stop offset="100%" stop-color="#070A14" />
    </linearGradient>
  </defs>

  <!-- Outer Hexagonal Emblem: Dark Navy #0B1020 with Precision Gold #F3B542 Rim -->
  <path
    d="M32 4.5 L56.5 18.6 V45.4 L32 59.5 L7.5 45.4 V18.6 Z"
    fill="url(#tcNavy)"
    stroke="url(#tcGold)"
    stroke-width="3.5"
    stroke-linejoin="round"
  />

  <!-- Inner Precision Geometric Crest & Tool Monogram -->
  <!-- Upper Crest Crown & 'T' Crossbar -->
  <path
    d="M17 21.5 L32 13 L47 21.5 L47 28.5 L36 22.5 V42.5 L32 48.5 L28 42.5 V22.5 L17 28.5 Z"
    fill="url(#tcGold)"
  />

  <!-- Subtle Diamond Core Facet for Optical Richness at larger sizes -->
  <polygon
    points="32,24 35.5,28.5 32,33 28.5,28.5"
    fill="#0B1020"
  />
</svg>
'''

def main():
    public_dir = os.path.abspath('public')
    svg_path = os.path.join(public_dir, 'favicon.svg')
    
    # 1. Write the pristine SVG
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(SVG_CONTENT)
    print(f"Generated {svg_path}")

    # Sizes to generate
    sizes = [
        (16, 'favicon-16x16.png'),
        (32, 'favicon-32x32.png'),
        (48, 'favicon-48x48.png'),
        (180, 'apple-touch-icon.png'),
        (192, 'android-chrome-192x192.png'),
        (512, 'android-chrome-512x512.png'),
    ]

    png_paths = {}
    for size, filename in sizes:
        dest_path = os.path.join(public_dir, filename)
        # Using ImageMagick convert with high density for crisp rasterization
        cmd = [
            'convert',
            '-background', 'transparent',
            '-density', '600',
            svg_path,
            '-resize', f'{size}x{size}',
            dest_path
        ]
        subprocess.run(cmd, check=True)
        png_paths[size] = dest_path
        print(f"Generated {dest_path} ({size}x{size})")

    # 2. Generate multi-resolution favicon.ico containing 16x16, 32x32, and 48x48
    ico_path = os.path.join(public_dir, 'favicon.ico')
    ico_cmd = [
        'convert',
        png_paths[16],
        png_paths[32],
        png_paths[48],
        ico_path
    ]
    subprocess.run(ico_cmd, check=True)
    print(f"Generated {ico_path} (multi-res 16, 32, 48)")

if __name__ == '__main__':
    main()
