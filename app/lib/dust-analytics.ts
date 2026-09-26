"use client";

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsValue>;

type Attribution = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  referrer: string;
};

const SESSION_KEY = "ds_analytics_session_id";
const ATTRIBUTION_KEY = "ds_analytics_attribution";
const ATTRIBUTION_COOKIE = "ds_attribution";

const safeSessionStorage = {
  get(key: string) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Analytics must never interrupt the product flow.
    }
  },
};

function getSessionId() {
  const existing = safeSessionStorage.get(SESSION_KEY);
  if (existing) return existing;

  const next =
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  safeSessionStorage.set(SESSION_KEY, next);
  return next;
}

function getDevice() {
  const ua = navigator.userAgent || "";
  if (/ipad|tablet|kindle|playbook|silk/i.test(ua)) return "tablet";
  if (/mobi|android|iphone|ipod/i.test(ua)) return "mobile";
  return "desktop";
}

function referralSource(referrer: string) {
  if (!referrer) return "direct";

  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host) return "direct";
    if (host.includes("google.")) return "google";
    if (host.includes("bing.")) return "bing";
    if (host.includes("facebook.") || host.includes("fb.")) return "facebook";
    if (host.includes("instagram.")) return "instagram";
    if (host.includes("x.com") || host.includes("twitter.")) return "x";
    if (host.includes("reddit.")) return "reddit";
    if (host.includes("linkedin.")) return "linkedin";
    return host;
  } catch {
    return "referral";
  }
}

function readCookie(name: string) {
  try {
    const prefix = `${name}=`;
    const part = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(prefix));
    return part ? decodeURIComponent(part.slice(prefix.length)) : "";
  } catch {
    return "";
  }
}

function readAttributionCookie(): Partial<Attribution> | null {
  const raw = readCookie(ATTRIBUTION_COOKIE);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function readAttribution(): Attribution {
  const existing = safeSessionStorage.get(ATTRIBUTION_KEY);
  if (existing) {
    try {
      return JSON.parse(existing) as Attribution;
    } catch {
      // Fall through and rebuild attribution.
    }
  }

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || "";
  const cookieAttribution = readAttributionCookie();
  const gclidPresent = Boolean(params.get("gclid"));
  const utmSource = params.get("utm_source") || cookieAttribution?.source || "";
  const utmMedium = params.get("utm_medium") || cookieAttribution?.medium || "";

  const source =
    utmSource ||
    (gclidPresent ? "google" : referralSource(referrer));

  const medium =
    utmMedium ||
    (gclidPresent ? "cpc" : utmSource ? "unknown" : referrer ? "referral" : "direct");

  const attribution: Attribution = {
    source,
    medium,
    campaign: params.get("utm_campaign") || cookieAttribution?.campaign || "",
    content: params.get("utm_content") || cookieAttribution?.content || "",
    term: params.get("utm_term") || cookieAttribution?.term || "",
    referrer,
  };

  safeSessionStorage.set(ATTRIBUTION_KEY, JSON.stringify(attribution));
  return attribution;
}

function cleanProperties(properties: AnalyticsProperties) {
  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      result[key] = value;
    }
  }

  return result;
}

export function getBrowserLanguage() {
  if (typeof navigator === "undefined") return "en";
  const value = String(navigator.language || "en").toLowerCase();
  return value.split("-")[0] || "en";
}

export function trackDustEvent(
  event: string,
  properties: AnalyticsProperties = {}
) {
  if (typeof window === "undefined") return;

  try {
    const attribution = readAttribution();
    const payload = {
      event,
      session_id: getSessionId(),
      device: getDevice(),
      path: window.location.pathname,
      ...attribution,
      properties: cleanProperties(properties),
    };

    const json = JSON.stringify(payload);

    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([json], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics-event", blob)) return;
    }

    void fetch("/api/analytics-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true,
    }).catch(() => {
      // Analytics failures are intentionally ignored.
    });
  } catch {
    // Analytics must never interrupt wallet scanning or LI.FI execution.
  }
}
