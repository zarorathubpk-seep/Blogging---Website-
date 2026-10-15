import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');

if (!fs.existsSync(sitemapPath)) {
  console.error('❌ public/sitemap.xml not found!');
  process.exit(1);
}

const content = fs.readFileSync(sitemapPath, 'utf-8');

// 1. Basic XML structure
if (!content.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
  console.error('❌ Missing XML declaration');
  process.exit(1);
}

if (!content.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">') || !content.endsWith('</urlset>\n') && !content.endsWith('</urlset>')) {
  console.error('❌ Missing or invalid <urlset> tag');
  process.exit(1);
}

// 2. Extract all URLs
const urlRegex = /<loc>(.*?)<\/loc>/g;
const urls: string[] = [];
let match;
while ((match = urlRegex.exec(content)) !== null) {
  urls.push(match[1]);
}

console.log(`✅ Found ${urls.length} URLs in sitemap.xml`);

// 3. Validation checks
let errors = 0;
urls.forEach((u) => {
  if (!u.startsWith('https://toolcrest.site')) {
    console.error(`❌ Non-canonical domain in: ${u}`);
    errors++;
  }
  if (u.includes('toolcrest.com')) {
    console.error(`❌ Old domain found in: ${u}`);
    errors++;
  }
  if (u.includes('zarorathub')) {
    console.error(`❌ Outdated brand found in: ${u}`);
    errors++;
  }
  if (u.includes('/admin')) {
    console.error(`❌ Non-indexable admin route found: ${u}`);
    errors++;
  }
});

// 4. Breakdown
const tools = urls.filter((u) => u.includes('/tools/'));
const blogs = urls.filter((u) => u.includes('/blog/'));
const core = urls.filter((u) => !u.includes('/tools/') && !u.includes('/blog/'));

console.log(`📊 Sitemap Inventory:`);
console.log(`   - Public Tools: ${tools.length}`);
console.log(`   - Published Articles: ${blogs.length}`);
console.log(`   - Core Pages (Home, Planner, Blog, Legal, Sitemap): ${core.length}`);
console.log(`   - Total URLs: ${urls.length}`);

if (errors === 0) {
  console.log('🎉 ALL SITEMAP VALIDATIONS PASSED!');
} else {
  console.error(`❌ Failed with ${errors} errors.`);
  process.exit(1);
}
