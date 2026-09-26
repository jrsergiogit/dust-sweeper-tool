import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function secretsMatch(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const webAppUrl = process.env.ANALYTICS_SHEETS_WEB_APP_URL;
  const sharedSecret = process.env.ANALYTICS_SHARED_SECRET;
  const dashboardPassword = process.env.ANALYTICS_DASHBOARD_PASSWORD;

  if (!webAppUrl || !sharedSecret || !dashboardPassword) {
    return NextResponse.json(
      { ok: false, error: "Analytics dashboard is not configured." },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization") || "";
  const receivedPassword = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!receivedPassword || !secretsMatch(receivedPassword, dashboardPassword)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedDays = Number(url.searchParams.get("days") || "30");
  const days = Math.min(365, Math.max(1, Number.isFinite(requestedDays) ? requestedDays : 30));

  try {
    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "dashboard",
        secret: sharedSecret,
        days,
      }),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "Analytics upstream error" }, { status: 502 });
    }

    const data = await response.json();
    if (!data?.ok) {
      return NextResponse.json(
        { ok: false, error: data?.error || "Unable to read analytics data." },
        { status: 502 }
      );
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to load analytics data." },
      { status: 502 }
    );
  }
}
