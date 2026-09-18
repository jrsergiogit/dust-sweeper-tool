import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  let changed = false;

  for (const key of Array.from(url.searchParams.keys())) {
    if (["_gl", "utm", "fbclid", "msclkid"].some(p => key.startsWith(p))) {
      url.searchParams.delete(key);
      changed = true;
    }
  }

  if (changed) return NextResponse.redirect(url, { status: 302 });
  return NextResponse.next();
}