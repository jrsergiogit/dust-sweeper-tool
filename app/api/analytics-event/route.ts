import { NextResponse } from 'next/server';
import { ALLOWED_EVENTS, cleanAnalyticsProperties, cleanText } from '../../lib/analytics-schema';
import { hasAllowedOrigin, rateAllowed, readSmallJson } from '../../lib/server/request-guard';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };
export async function POST(request: Request) {
  if (process.env.DUST_LOCAL_PREVIEW === '1' || process.env.NODE_ENV === 'development') return NextResponse.json({ ok: true, local_preview: true }, { status: 202, headers });
  if (!hasAllowedOrigin(request)) return NextResponse.json({ ok: false }, { status: 403, headers });
  if (!await rateAllowed(request, 'events', 180, 60)) return NextResponse.json({ ok: false }, { status: 429, headers });
  const url = process.env.ANALYTICS_SHEETS_WEB_APP_URL;
  const secret = process.env.ANALYTICS_SHARED_SECRET;
  if (!url || !secret) return NextResponse.json({ ok: true, configured: false }, { status: 202, headers });
  try {
    const raw = await readSmallJson(request) as Record<string, unknown>;
    const event = cleanText(raw?.event, 60);
    const session = cleanText(raw?.session_id, 100);
    const eventId = cleanText(raw?.event_id, 100);
    if (!ALLOWED_EVENTS.has(event) || !/^[a-zA-Z0-9_-]{6,100}$/.test(session)
      || !/^[a-zA-Z0-9_-]{6,100}$/.test(eventId)) {
      return NextResponse.json({ ok: false, error: 'Invalid event' }, { status: 400, headers });
    }
    const properties = cleanAnalyticsProperties(raw.properties);
    const occurred = typeof raw.occurred_at === 'string' ? Date.parse(raw.occurred_at) : NaN;
    const now = Date.now();
    // Legacy clients may omit this. Keep missing times empty instead of inventing client order.
    const occurredAt = Number.isFinite(occurred) && occurred <= now + 60_000 && occurred >= now - 7 * 86_400_000
      ? new Date(occurred).toISOString() : '';
    const data = {
      event, event_id: eventId, occurred_at: occurredAt, session_id: session,
      device: cleanText(raw.device, 20), path: cleanText(raw.path, 160).split('?')[0],
      source: cleanText(raw.source, 100), medium: cleanText(raw.medium, 100),
      campaign: cleanText(raw.campaign), content: cleanText(raw.content), term: cleanText(raw.term),
      referrer: cleanText(raw.referrer, 180), properties,
    };
    const response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'event', secret, data }), redirect: 'follow',
      cache: 'no-store', signal: AbortSignal.timeout(6000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok === false) return NextResponse.json({ ok: false, error: 'Analytics upstream error' }, { status: 502, headers });
    return NextResponse.json({ ok: true }, { headers });
  } catch {
    return NextResponse.json({ ok: false, error: 'Analytics write failed' }, { status: 400, headers });
  }
}
