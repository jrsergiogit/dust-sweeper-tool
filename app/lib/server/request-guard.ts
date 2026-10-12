import { createHash } from 'node:crypto';

/** Defense in depth, not authentication. Non-browser callers can forge Origin. */
export function hasAllowedOrigin(request: Request): boolean {
  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

export function clientKey(request: Request): string {
  // Trust these headers only behind a reverse proxy that overwrites them.
  const value = request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')?.trim() || 'unknown';
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

const windows = new Map<string, { count: number; expires: number }>();
let lastSweep = 0;
export function localLimit(key: string, limit: number, durationMs: number, now = Date.now()): boolean {
  if (now - lastSweep > 60_000 || windows.size > 10_000) {
    for (const [k, entry] of windows) if (entry.expires <= now) windows.delete(k);
    lastSweep = now;
  }
  let entry = windows.get(key);
  if (!entry || entry.expires <= now) {
    // Bound memory even if many different source addresses are supplied.
    if (windows.size >= 20_000) return false;
    entry = { count: 0, expires: now + durationMs };
    windows.set(key, entry);
  }
  entry.count += 1;
  return entry.count <= limit;
}

/** Optional shared Redis REST limiter. In-memory fallback is instance-local only. */
export async function rateAllowed(request: Request, scope: string, limit: number, seconds: number): Promise<boolean> {
  const key = `ds:${scope}:${clientKey(request)}:${Math.floor(Date.now() / (seconds * 1000))}`;
  const url = process.env.RATE_LIMIT_REDIS_REST_URL;
  const token = process.env.RATE_LIMIT_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      if (!url.startsWith('https://')) throw new Error('Redis REST URL must use HTTPS');
      const response = await fetch(url.replace(/\/$/, ''), {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([
          "EVAL", "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",
          '1', key, String(seconds + 1),
        ]),
        cache: 'no-store', signal: AbortSignal.timeout(2500),
      });
      const result = await response.json();
      if (!response.ok || !Number.isFinite(Number(result.result)) || result.error) throw new Error('Limiter unavailable');
      return Number(result.result) <= limit;
    } catch {
      // Paid/provider endpoints fail closed when a configured shared limiter is unavailable.
      return false;
    }
  }
  return localLimit(key, limit, seconds * 1000);
}

export async function readSmallJson(request: Request, maxBytes = 12_000): Promise<unknown> {
  if (Number(request.headers.get('content-length') || 0) > maxBytes) throw new Error('BODY_TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('INVALID_JSON');
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) { await reader.cancel(); throw new Error('BODY_TOO_LARGE'); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { reader.releaseLock(); }
}
