import { TOOLS_DATA, ToolItem } from '../data/toolsData';
import { INITIAL_ARTICLES } from '../data/defaultArticles';
import { Article } from '../types/article';

export const CANONICAL_DOMAIN = 'https://toolcrest.site';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

/**
 * Normalizes any date string or timestamp into YYYY-MM-DD
 */
export function formatIsoDate(dateInput?: string | number | Date): string {
  if (!dateInput) return '2026-10-13';
  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {}
  return '2026-10-13';
}

/**
 * Builds the complete list of indexable, canonical URLs for ToolCrest
 */
export function getSitemapEntries(customArticles?: Article[]): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const today = '2026-10-13';

  // 1. Core Pillar Pages
  entries.push({
    loc: `${CANONICAL_DOMAIN}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0',
  });

  entries.push({
    loc: `${CANONICAL_DOMAIN}/planner`,
    lastmod: today,
    changefreq: 'weekly',
    priority: '0.9',
  });

  entries.push({
    loc: `${CANONICAL_DOMAIN}/blog`,
    lastmod: today,
    changefreq: 'daily',
    priority: '0.8',
  });

  // 2. All Public Tool Pages (automatically includes all tools from TOOLS_DATA)
  // Higher priority (0.85) for popular tools, 0.8 for all standard tools
  TOOLS_DATA.forEach((tool: ToolItem) => {
    entries.push({
      loc: `${CANONICAL_DOMAIN}/tools/${tool.slug}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: tool.isPopular ? '0.85' : '0.8',
    });
  });

  // 3. All Published Blog Articles (actual published articles, excluding drafts)
  const articlesList = customArticles && customArticles.length > 0 ? customArticles : INITIAL_ARTICLES;
  articlesList
    .filter((article) => article.isPublished !== false)
    .forEach((article) => {
      const articleDate = formatIsoDate(article.publishedAt || article.order ? `2026-10-${String(Math.min(28, (article.order || 1) + 1)).padStart(2, '0')}` : undefined);
      entries.push({
        loc: `${CANONICAL_DOMAIN}/blog/${article.slug}`,
        lastmod: articleDate,
        changefreq: 'monthly',
        priority: '0.7',
      });
    });

  // 4. Important Public Info & Legal Pages (indexable, canonical versions)
  entries.push({
    loc: `${CANONICAL_DOMAIN}/about-us`,
    lastmod: '2026-10-12',
    changefreq: 'monthly',
    priority: '0.6',
  });

  entries.push({
    loc: `${CANONICAL_DOMAIN}/contact-us`,
    lastmod: '2026-10-12',
    changefreq: 'monthly',
    priority: '0.6',
  });

  entries.push({
    loc: `${CANONICAL_DOMAIN}/privacy-policy`,
    lastmod: '2026-10-12',
    changefreq: 'monthly',
    priority: '0.5',
  });

  entries.push({
    loc: `${CANONICAL_DOMAIN}/terms-and-conditions`,
    lastmod: '2026-10-12',
    changefreq: 'monthly',
    priority: '0.5',
  });

  entries.push({
    loc: `${CANONICAL_DOMAIN}/disclaimer`,
    lastmod: '2026-10-12',
    changefreq: 'monthly',
    priority: '0.5',
  });

  entries.push({
    loc: `${CANONICAL_DOMAIN}/cookie-policy`,
    lastmod: '2026-10-12',
    changefreq: 'monthly',
    priority: '0.5',
  });

  entries.push({
    loc: `${CANONICAL_DOMAIN}/sitemap`,
    lastmod: today,
    changefreq: 'monthly',
    priority: '0.4',
  });

  return entries;
}

/**
 * Generates valid XML according to https://www.sitemaps.org/schemas/sitemap/0.9
 */
export function generateSitemapXml(customArticles?: Article[]): string {
  const entries = getSitemapEntries(customArticles);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  entries.forEach((item) => {
    xml += '  <url>\n';
    xml += `    <loc>${item.loc}</loc>\n`;
    xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';
  return xml;
}
