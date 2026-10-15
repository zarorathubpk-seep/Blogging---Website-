/**
 * Google Analytics 4 (GA4) Tracking Integration for ToolCrest
 * Measurement ID: G-EM9BQ097R4
 *
 * Designed for SPA / React client-side routing and GitHub Pages hosting.
 * Prevents duplicate page views by managing route tracking Authoritatively.
 */

export const GA_MEASUREMENT_ID = 'G-EM9BQ097R4';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Checks whether user consent permits analytics tracking.
 * Defaults to true unless explicitly rejected in localStorage.
 */
export function isAnalyticsPermitted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const consent = localStorage.getItem('toolcrest_analytics_consent');
    if (consent === 'denied' || consent === 'false') {
      return false;
    }
  } catch {
    // If localStorage is unavailable, proceed safely
  }
  return true;
}

/**
 * Updates analytics consent (grant / deny) and informs gtag consent mode
 */
export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('toolcrest_analytics_consent', granted ? 'granted' : 'denied');
  } catch {}

  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
}

/**
 * Tracks a page view for React client-side route changes.
 * Avoids duplicate page views on SPA navigation.
 */
export function trackPageView(path: string, pageTitle?: string): void {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsPermitted()) return;

  const currentTitle = pageTitle || document.title || 'ToolCrest';
  const fullUrl = window.location.origin + (path.startsWith('/') ? path : '/' + path);

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: currentTitle,
      page_location: fullUrl,
      send_to: GA_MEASUREMENT_ID,
    });
  } else {
    // If gtag script is still loading, queue into dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_title: currentTitle,
      page_location: fullUrl,
      send_to: GA_MEASUREMENT_ID,
    });
  }
}

/**
 * Tracks custom user interactions (tool executions, downloads, conversions)
 */
export function trackEvent(
  action: string,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsPermitted()) return;

  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      ...params,
      send_to: GA_MEASUREMENT_ID,
    });
  }
}
