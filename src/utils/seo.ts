export const SITE_DOMAIN = 'https://toolcrest.site';
export const DEFAULT_OG_IMAGE = `${SITE_DOMAIN}/apple-touch-icon.png`;

export interface SeoConfig {
  title: string;
  description: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function updatePageSeo(config: SeoConfig) {
  // 1. Page Title
  document.title = config.title;

  // 2. Meta Description
  upsertMetaTag('name', 'description', config.description);

  // 3. Canonical URL (Strictly using https://toolcrest.site)
  const canonicalHref = config.canonicalUrl
    ? config.canonicalUrl
    : config.canonicalPath
    ? `${SITE_DOMAIN}${config.canonicalPath.startsWith('/') ? config.canonicalPath : '/' + config.canonicalPath}`
    : `${SITE_DOMAIN}${window.location.pathname}`;

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalHref);

  // 4. OpenGraph & Twitter Cards
  const ogImage = config.ogImage || DEFAULT_OG_IMAGE;
  upsertMetaTag('property', 'og:type', config.ogType || 'website');
  upsertMetaTag('property', 'og:title', config.title);
  upsertMetaTag('property', 'og:description', config.description);
  upsertMetaTag('property', 'og:url', canonicalHref);
  upsertMetaTag('property', 'og:image', ogImage);

  upsertMetaTag('name', 'twitter:card', 'summary_large_image');
  upsertMetaTag('name', 'twitter:title', config.title);
  upsertMetaTag('name', 'twitter:description', config.description);
  upsertMetaTag('name', 'twitter:image', ogImage);

  // 5. Robots Tag (noindex for admin, draft, or 404 views)
  upsertMetaTag('name', 'robots', config.noindex ? 'noindex, nofollow' : 'index, follow');

  // 6. Structured Data (Schema.org JSON-LD)
  const scriptId = 'toolcrest-jsonld';
  let jsonLdScript = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (config.jsonLd) {
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = scriptId;
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(config.jsonLd);
  } else if (jsonLdScript) {
    jsonLdScript.remove();
  }
}
