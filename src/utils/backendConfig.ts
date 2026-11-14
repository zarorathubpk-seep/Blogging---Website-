/**
 * Resolves the backend API base URL for ToolCrest AI features (/api/chat, /api/translate).
 *
 * - When VITE_BACKEND_API_URL is set at build time (e.g. GitHub Pages pointing to Render / Cloud Run),
 *   returns that normalized base URL.
 * - When running locally (localhost / 127.0.0.1) or on an integrated full-stack Cloud Run service,
 *   returns '' (same-origin relative /api/* path).
 * - On static hosting without VITE_BACKEND_API_URL configured, returns null so callers can
 *   surface an accurate configuration notice rather than failing against a dead dev endpoint.
 */
export function getBackendBaseUrl(): string | null {
  const configured = (import.meta as any).env?.VITE_BACKEND_API_URL;
  if (configured && typeof configured === 'string' && configured.trim().length > 0) {
    return configured.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.run.app')) {
      return '';
    }
  }

  return null;
}

export function getBackendEndpoint(path: string): string | null {
  const base = getBackendBaseUrl();
  if (base === null) return null;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
