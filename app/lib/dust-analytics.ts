'use client';

export type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsValue>;
type Attribution = {
  version: number; source: string; medium: string; campaign: string; content: string; term: string;
  referrer: string; landing_path: string; gclid?: string; gbraid?: string; wbraid?: string;
};
const SESSION_KEY = 'ds_analytics_session_id';
const ACTIVITY_KEY = 'ds_analytics_last_activity';
const ATTRIBUTION_KEY = 'ds_analytics_attribution';
const IDLE_MS = 30 * 60 * 1000;
let memorySession = '';
let memoryAttribution: Attribution | null = null;
let memoryLastActivity = 0;

const storage = {
  get(key: string) { try { return window.sessionStorage.getItem(key); } catch { return null; } },
  set(key: string, value: string) { try { window.sessionStorage.setItem(key, value); } catch {} },
  remove(key: string) { try { window.sessionStorage.removeItem(key); } catch {} },
};
export function anonymousId(): string {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function sessionId(): string {
  const now = Date.now();
  const last = Number(storage.get(ACTIVITY_KEY)) || memoryLastActivity;
  if (last && now - last > IDLE_MS) {
    storage.remove(SESSION_KEY); storage.remove(ATTRIBUTION_KEY);
    memorySession = ''; memoryAttribution = null;
    // Old landing parameters must not reappear in a new idle-timeout session.
    delete (window as any).__dsLandingAttribution;
  }
  const id = storage.get(SESSION_KEY) || memorySession || anonymousId();
  memorySession = id; memoryLastActivity = now;
  storage.set(SESSION_KEY, id); storage.set(ACTIVITY_KEY, String(now));
  return id;
}
function cleanPath(path: string): string {
  return path.replace(/0x[a-fA-F0-9]{40,64}/g, '[redacted]').slice(0, 160);
}
function externalReferrer(raw: string): string {
  try {
    const url = new URL(raw);
    const ourHost = window.location.hostname.replace(/^www\./, '');
    if (url.hostname.replace(/^www\./, '') === ourHost) return '';
    return url.origin; // Never retain query strings from referral URLs.
  } catch { return ''; }
}
function referralSource(referrer: string): string {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (/(^|\.)google\./.test(host)) return 'google';
    if (/(^|\.)bing\.com$/.test(host)) return 'bing';
    return host;
  } catch { return 'referral'; }
}

/** Must run BEFORE CleanUrl; first-touch attribution is stable within a session. */
export function captureAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  sessionId();
  const stored = storage.get(ATTRIBUTION_KEY);
  try {
    const existing = stored ? JSON.parse(stored) : memoryAttribution;
    if (existing?.version === 2 && typeof existing.source === 'string') return existing as Attribution;
  } catch {}
  const bootstrap = (window as any).__dsLandingAttribution;
  const params = new URLSearchParams(window.location.search);
  const get = (key: string) => (params.get(key) || bootstrap?.params?.[key] || '').slice(0, 500);
  const gclid = get('gclid'), gbraid = get('gbraid'), wbraid = get('wbraid');
  const paidGoogle = Boolean(gclid || gbraid || wbraid);
  const sourceParam = get('utm_source');
  const referrer = externalReferrer(bootstrap?.referrer || document.referrer || '');
  const attribution: Attribution = {
    version: 2,
    source: sourceParam || (paidGoogle ? 'google' : referralSource(referrer)),
    medium: get('utm_medium') || (paidGoogle ? 'cpc' : sourceParam ? 'unknown' : referrer ? 'referral' : 'direct'),
    campaign: get('utm_campaign'), content: get('utm_content'), term: get('utm_term'), referrer,
    landing_path: cleanPath(bootstrap?.path || window.location.pathname), gclid, gbraid, wbraid,
  };
  memoryAttribution = attribution;
  storage.set(ATTRIBUTION_KEY, JSON.stringify(attribution));
  return attribution;
}
export function getBrowserLanguage(): string {
  return typeof navigator === 'undefined' ? 'en' : String(navigator.language || 'en').toLowerCase().split('-')[0];
}
function device(): string {
  const ua = navigator.userAgent || '';
  return /ipad|tablet|kindle|playbook|silk/i.test(ua) ? 'tablet' : /mobi|android|iphone|ipod/i.test(ua) ? 'mobile' : 'desktop';
}

export function trackDustEvent(event: string, properties: AnalyticsProperties = {}) {
  if (typeof window === 'undefined' || window.location.pathname.startsWith('/admin') || ['localhost', '127.0.0.1', '::1', '[::1]'].includes(window.location.hostname)) return;
  try {
    const attribution = captureAttribution();
    if (!attribution) return;
    // Click identifiers stay in sessionStorage for attribution, not in Google Sheets.
    const { gclid, gbraid, wbraid, version: _version, ...publicAttribution } = attribution;
    const safeProperties: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === 'string') safeProperties[key] = value.slice(0, 120);
      else if (typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) safeProperties[key] = value;
    }
    const json = JSON.stringify({
      event, event_id: anonymousId(), occurred_at: new Date().toISOString(), schema_version: 3, session_id: sessionId(), device: device(),
      path: cleanPath(window.location.pathname), ...publicAttribution,
      properties: { language: getBrowserLanguage(), ...safeProperties, analytics_version: 'v3', has_ad_click: Boolean(gclid || gbraid || wbraid) },
    });
    if (navigator.sendBeacon?.('/api/analytics-event', new Blob([json], { type: 'application/json' }))) return;
    void fetch('/api/analytics-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: json, keepalive: true }).catch(() => {});
  } catch { /* Measurement must never interrupt a scan or a transaction. */ }
}

let lastPage = '';
let lastPageAt = 0;
export function trackPageView(path: string) {
  if (typeof window === 'undefined' || path.startsWith('/admin')) return;
  const now = Date.now();
  if (lastPage === path && now - lastPageAt < 1500) return; // React StrictMode replay.
  lastPage = path; lastPageAt = now;
  trackDustEvent('page_view', { language: getBrowserLanguage() });
}
