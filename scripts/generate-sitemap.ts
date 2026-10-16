import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSitemapXml } from '../src/utils/sitemapGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function writeSitemapFiles() {
  const xml = generateSitemapXml();
  const publicPath = path.join(rootDir, 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf-8');
  console.log(`[Sitemap] Generated public/sitemap.xml (${xml.length} bytes)`);

  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    const distPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distPath, xml, 'utf-8');
    console.log(`[Sitemap] Copied to dist/sitemap.xml`);

    // Ensure 404.html exists in dist for GitHub Pages SPA routing
    const distIndex = path.join(distDir, 'index.html');
    const dist404 = path.join(distDir, '404.html');
    if (fs.existsSync(distIndex)) {
      fs.copyFileSync(distIndex, dist404);
      console.log(`[GitHub Pages] Synced dist/404.html from dist/index.html`);
    }
  }
}

writeSitemapFiles();
