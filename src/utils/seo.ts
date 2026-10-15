export const SITE_DOMAIN = 'https://toolcrest.site';

export interface SeoConfig {
  title: string;
  description: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: string;
  noindex?: boolean;
}

export function updatePageSeo(config: SeoConfig) {
  // 1. Page Title
  document.title = config.title;

  // 2. Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // 3. OpenGraph Title & Description
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', config.title);
  }

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', config.description);
  }

  // 4. Canonical URL (Strictly using https://toolcrest.site)
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

  // 5. OpenGraph URL
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', canonicalHref);

  // 6. Robots Tag (noindex for non-public or admin views)
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute('content', config.noindex ? 'noindex, nofollow' : 'index, follow');
}
