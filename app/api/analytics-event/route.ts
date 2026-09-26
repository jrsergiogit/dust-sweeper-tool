import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "finder_opened",
  "wallet_opened",
  "bridge_opened",
  "swap_opened",
  "scam_scan_opened",
  "wallet_scan_started",
  "wallet_scan_completed",
  "wallet_scan_failed",
  "wallet_assets_found",
  "recovery_asset_selected",
  "recovery_route_available",
  "recovery_route_failed",
  "recovery_execution_failed",
  "recovery_completed",
  "portfolio_scan_started",
  "portfolio_scan_completed",
  "portfolio_scan_failed",
  "scam_scan_started",
  "scam_scan_completed",
  "scam_scan_failed",
  "bridge_completed",
  "swap_completed",
  "safety_trade_completed",
]);

function cleanText(value: unknown, max = 180) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function cleanProperty(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return value.slice(0, 120);
  return "";
}

export async function POST(request: Request) {
  const webAppUrl = process.env.ANALYTICS_SHEETS_WEB_APP_URL;
  const sharedSecret = process.env.ANALYTICS_SHARED_SECRET;

  // Analytics is deliberately optional. A tracking outage must never block
  // wallet scans, route checks, swaps, bridges or recovery transactions.
  if (!webAppUrl || !sharedSecret) {
    return NextResponse.json({ ok: true, configured: false }, { status: 202 });
  }

  try {
    const raw = await request.json();
    const event = cleanText(raw?.event, 60);

    if (!ALLOWED_EVENTS.has(event)) {
      return NextResponse.json({ ok: false, error: "Invalid event" }, { status: 400 });
    }

    const incomingProperties =
      raw?.properties && typeof raw.properties === "object" ? raw.properties : {};

    const properties: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(incomingProperties)) {
      if (Object.keys(properties).length >= 16) break;
      const cleanKey = cleanText(key, 40);
      if (!cleanKey) continue;
      const cleanValue = cleanProperty(value);
      if (cleanValue === "" && value !== "") continue;
      properties[cleanKey] = cleanValue;
    }

    const payload = {
      action: "event",
      secret: sharedSecret,
      data: {
        event,
        session_id: cleanText(raw?.session_id, 100),
        device: cleanText(raw?.device, 20),
        path: cleanText(raw?.path, 160),
        source: cleanText(raw?.source, 100),
        medium: cleanText(raw?.medium, 100),
        campaign: cleanText(raw?.campaign, 140),
        content: cleanText(raw?.content, 140),
        term: cleanText(raw?.term, 140),
        referrer: cleanText(raw?.referrer, 300),
        properties,
      },
    };

    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "Analytics upstream error" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Analytics write failed" }, { status: 500 });
  }
}
