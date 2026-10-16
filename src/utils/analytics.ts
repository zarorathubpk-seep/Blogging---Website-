/**
 * Google Analytics 4 (GA4) Tracking & Google Consent Mode v2 Integration for ToolCrest
 * Measurement ID: G-EM9BQ097R4
 *
 * Full compliance with:
 * - Google Consent Mode v2 (analytics_storage, ad_storage, ad_user_data, ad_personalization)
 * - CookieYes CMP integration (event listener + cookie parsing + dynamic load detection)
 * - React SPA client-side routing & GitHub Pages hosting
 * - Google Tag Assistant & GA4 DebugView support
 * - Event deduplication and guaranteed post-consent page_view delivery
 */

export const GA_MEASUREMENT_ID = 'G-EM9BQ097R4';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    cookieyes?: {
      isCategoryAllowed?: (category: string) => boolean;
      [key: string]: any;
    };
    __toolcrest_consented_pv_fired?: boolean;
    __toolcrest_consent_already_granted?: boolean;
  }
}

let hasConsentedPageViewFired = false;
let lastTrackedPath: string | null = null;
let lastTrackedTime = 0;
let consentListenersInitialized = false;

/**
 * Detects whether DebugView is active via Tag Assistant or URL parameters
 */
export function isDebugModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const search = window.location.search || '';
    if (
      search.includes('gtm_debug=') ||
      search.includes('debug_mode=true') ||
      search.includes('ga_debug') ||
      search.includes('debug=true')
    ) {
      return true;
    }
    return sessionStorage.getItem('ga_debug') === 'true';
  } catch {
    return false;
  }
}

/**
 * Checks whether CookieYes CMP is installed or active on the page
 */
export function isCookieYesActive(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    if (document.getElementById('cookieyes') || document.querySelector('.cky-consent-container')) {
      return true;
    }
    if (typeof window !== 'undefined' && window.cookieyes) {
      return true;
    }
    if (document.cookie.includes('cookieyes-consent=')) {
      return true;
    }
  } catch {}
  return false;
}

/**
 * Reads existing CookieYes consent status directly from cookieyes-consent cookie
 */
export function getCookieYesConsent(): { hasConsent: boolean; analytics: boolean; ads: boolean } | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(/(?:^|;\s*)cookieyes-consent=([^;]+)/);
    if (!match) return null;
    const val = decodeURIComponent(match[1]);
    const analyticsYes = val.includes('analytics:yes');
    const analyticsNo = val.includes('analytics:no');
    const adsYes = val.includes('advertisement:yes');
    if (analyticsYes || analyticsNo) {
      return {
        hasConsent: true,
        analytics: analyticsYes,
        ads: adsYes,
      };
    }
  } catch {}
  return null;
}

/**
 * Checks if analytics storage is permitted by user consent
 */
export function isAnalyticsPermitted(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check window flag set during HTML pre-check
  if (window.__toolcrest_consent_already_granted) {
    return true;
  }

  // 2. Check CookieYes cookie if present
  const ckyConsent = getCookieYesConsent();
  if (ckyConsent !== null) {
    return ckyConsent.analytics;
  }

  // 3. Check CookieYes global API if available
  if (window.cookieyes && typeof window.cookieyes.isCategoryAllowed === 'function') {
    return window.cookieyes.isCategoryAllowed('analytics');
  }

  // 4. Check local fallback consent storage
  try {
    const consent = localStorage.getItem('toolcrest_analytics_consent');
    if (consent === 'granted' || consent === 'true') {
      return true;
    }
    if (consent === 'denied' || consent === 'false') {
      return false;
    }
  } catch {}

  // In Google Consent Mode v2, default is denied until user accepts
  return false;
}

/**
 * Sends the initial page_view once consent is granted
 */
export function sendInitialPageViewAfterConsent(): void {
  if (typeof window === 'undefined') return;
  if (hasConsentedPageViewFired || window.__toolcrest_consented_pv_fired) return;

  hasConsentedPageViewFired = true;
  window.__toolcrest_consented_pv_fired = true;

  const path = window.location.pathname || '/';
  const title = document.title || 'ToolCrest';

  if (isDebugModeActive()) {
    console.log('[GA4] Firing initial consented page_view for:', path);
  }

  trackPageView(path, title, true);
}

/**
 * Updates analytics consent (grant / deny) manually and updates GCM v2
 */
export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('toolcrest_analytics_consent', granted ? 'granted' : 'denied');
  } catch {}

  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
    });
  }

  if (granted) {
    window.__toolcrest_consent_already_granted = true;
    sendInitialPageViewAfterConsent();
  }
}

/**
 * Sets up listeners for CookieYes events and synchronizes Google Consent Mode v2
 */
export function initConsentAndAnalytics(): void {
  if (typeof window === 'undefined' || consentListenersInitialized) return;
  consentListenersInitialized = true;

  // Check if CookieYes or localStorage already has recorded consent
  const existingCky = getCookieYesConsent();
  if (existingCky && existingCky.hasConsent) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: existingCky.analytics ? 'granted' : 'denied',
        ad_storage: existingCky.ads ? 'granted' : 'denied',
        ad_user_data: existingCky.ads ? 'granted' : 'denied',
        ad_personalization: existingCky.ads ? 'granted' : 'denied',
      });
    }
    if (existingCky.analytics) {
      window.__toolcrest_consent_already_granted = true;
    }
  }

  const handleConsentUpdate = (eventData: any) => {
    try {
      const detail = eventData?.detail;
      let accepted: string[] = [];
      if (detail) {
        if (Array.isArray(detail.accepted)) {
          accepted = detail.accepted;
        } else if (Array.isArray(detail.categories)) {
          accepted = detail.categories;
        } else if (typeof detail.accepted === 'string') {
          accepted = detail.accepted.split(',').map((s: string) => s.trim());
        }
      }

      const ckyMatch = document.cookie.match(/(?:^|;\s*)cookieyes-consent=([^;]+)/);
      const ckyVal = ckyMatch ? decodeURIComponent(ckyMatch[1]) : '';

      const analyticsGranted =
        accepted.includes('analytics') || ckyVal.includes('analytics:yes');
      const adsGranted =
        accepted.includes('advertisement') || ckyVal.includes('advertisement:yes');
      const functionalGranted =
        accepted.includes('functional') || ckyVal.includes('functional:yes');

      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: analyticsGranted ? 'granted' : 'denied',
          ad_storage: adsGranted ? 'granted' : 'denied',
          ad_user_data: adsGranted ? 'granted' : 'denied',
          ad_personalization: adsGranted ? 'granted' : 'denied',
          personalization_storage: functionalGranted ? 'granted' : 'denied',
          functionality_storage: 'granted',
        });
      }

      if (isDebugModeActive()) {
        console.log('[GA4 / CookieYes] Consent update received:', {
          analyticsGranted,
          adsGranted,
          functionalGranted,
        });
      }

      if (analyticsGranted) {
        window.__toolcrest_consent_already_granted = true;
        sendInitialPageViewAfterConsent();
      }
    } catch (err) {
      console.warn('[GA4] Error handling cookieyes_consent_update:', err);
    }
  };

  document.addEventListener('cookieyes_consent_update', handleConsentUpdate);
  window.addEventListener('cookieyes_consent_update', handleConsentUpdate);

  // If already consented when this module initializes, mark consented state
  if (isAnalyticsPermitted()) {
    hasConsentedPageViewFired = true;
    window.__toolcrest_consented_pv_fired = true;
  }
}

/**
 * Tracks a page view for React client-side route changes without duplicates.
 * Compatible with GitHub Pages, SPA history navigation, and GA4 DebugView.
 */
export function trackPageView(path: string, pageTitle?: string, force = false): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  // Prevent duplicate page_view events for the same path within 400ms unless explicitly forced
  if (!force && lastTrackedPath === path && now - lastTrackedTime < 400) {
    return;
  }

  lastTrackedPath = path;
  lastTrackedTime = now;

  const currentTitle = pageTitle || document.title || 'ToolCrest';
  const fullUrl = window.location.origin + (path.startsWith('/') ? path : '/' + path);
  const isDebug = isDebugModeActive();

  if (isAnalyticsPermitted()) {
    hasConsentedPageViewFired = true;
    window.__toolcrest_consented_pv_fired = true;
  }

  const eventParams: Record<string, any> = {
    page_path: path,
    page_title: currentTitle,
    page_location: fullUrl,
    send_to: GA_MEASUREMENT_ID,
  };

  if (isDebug) {
    eventParams.debug_mode = true;
    console.log('[GA4 DebugView] Tracked page_view:', eventParams);
  }

  if (typeof window.gtag === 'function') {
    // Keep internal GA4 config synchronized with the current route for subsequent custom events
    window.gtag('set', {
      page_path: path,
      page_title: currentTitle,
      page_location: fullUrl,
    });
    window.gtag('event', 'page_view', eventParams);
  } else {
    // If gtag script is still loading, queue into dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      ...eventParams,
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

  const isDebug = isDebugModeActive();
  const eventPayload: Record<string, any> = {
    ...params,
    send_to: GA_MEASUREMENT_ID,
  };

  if (isDebug) {
    eventPayload.debug_mode = true;
    console.log(`[GA4 DebugView] Tracked event (${action}):`, eventPayload);
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', action, eventPayload);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: action,
      ...eventPayload,
    });
  }
}

// Automatically initialize listeners upon module load in the browser
if (typeof window !== 'undefined') {
  initConsentAndAnalytics();
}
