import { NextRequest, NextResponse } from "next/server";

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Kotoba Swap (Private)"',
    },
  });
}

function decodeBasicAuth(authHeader: string): { user: string; pass: string } | null {
  const prefix = "Basic ";
  if (!authHeader.startsWith(prefix)) return null;

  const token = authHeader.slice(prefix.length).trim();
  if (!token) return null;

  try {
    const decoded = globalThis.atob(token);
    const idx = decoded.indexOf(":");
    if (idx < 0) return null;
    return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  // ローカル開発では素通し（Vercel本番のみを対象）
  const isVercelProd = process.env.VERCEL_ENV === "production";
  if (!isVercelProd) return NextResponse.next();

  // 本番を非公開にしたい場合に Basic 認証を有効化
  // - SITE_BASIC_AUTH_USER / SITE_BASIC_AUTH_PASS を Vercel の環境変数に設定してください
  const expectedUser = process.env.SITE_BASIC_AUTH_USER;
  const expectedPass = process.env.SITE_BASIC_AUTH_PASS;

  // 環境変数未設定のまま本番に上がった場合は、意図せず公開しないように 503 でブロックします
  if (!expectedUser || !expectedPass) {
    return new NextResponse("Site is private. Missing auth env vars.", { status: 503 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const creds = decodeBasicAuth(authHeader);
  if (!creds) return unauthorized();

  if (creds.user !== expectedUser || creds.pass !== expectedPass) return unauthorized();
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
