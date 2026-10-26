import subprocess
import os

svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <!-- Rich Golden Gradient -->
    <linearGradient id="tcGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="50%" stop-color="#F3B542" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- Subtle Deep Navy Gradient for Hexagon Canvas -->
    <linearGradient id="tcNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111827" />
      <stop offset="100%" stop-color="#0B1020" />
    </linearGradient>
  </defs>

  <!-- Outer Hexagon Badge: Dark Navy #0B1020 with Gold #F3B542 Rim -->
  <path
    d="M32 4.5 L56.5 18.6 V45.4 L32 59.5 L7.5 45.4 V18.6 Z"
    fill="url(#tcNavy)"
    stroke="url(#tcGold)"
    stroke-width="3.5"
    stroke-linejoin="round"
  />

  <!-- ToolCrest Geometric Emblem: Modern Hexagonal Crest & "T" -->
  <!-- Upper Crest Crossbar (Chevron Crown) -->
  <path
    d="M16.5 22.5 L32 13.5 L47.5 22.5 L43.5 28.5 L32 21.8 L20.5 28.5 Z"
    fill="url(#tcGold)"
  />

  <!-- Central Precision Spire / Stem -->
  <path
    d="M28.5 22.5 H35.5 V38 L32 44.5 L28.5 38 Z"
    fill="url(#tcGold)"
  />

  <!-- Flanking Geometric Facets (Balanced Architecture) -->
  <polygon
    points="18.5,31.5 25,27.5 25,38 18.5,41.5"
    fill="url(#tcGold)"
    opacity="0.9"
  />
  <polygon
    points="45.5,31.5 39,27.5 39,38 45.5,41.5"
    fill="url(#tcGold)"
    opacity="0.9"
  />

  <!-- Bottom Apex Jewel (Harmonizing Balance) -->
  <polygon
    points="32,47 35.5,51.5 32,54 28.5,51.5"
    fill="url(#tcGold)"
  />
</svg>'''

with open('scripts/generate_favicons.py', 'w') as f:
    f.write('''# Favicon generator
''')

with open('/tmp/test_icon.svg', 'w') as f:
    f.write(svg_content)

print("SVG written to /tmp/test_icon.svg")
