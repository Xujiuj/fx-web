import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  authenticateAdmin,
  createAdminSessionValue
} from "@/lib/admin-auth";
import { readJsonBody } from "@/lib/request-security";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_BUCKETS = 1000;

function cleanupAttempts(now: number) {
  for (const [key, value] of attempts) {
    if (value.resetAt <= now) attempts.delete(key);
  }
  while (attempts.size > MAX_BUCKETS) {
    const oldest = attempts.keys().next().value as string | undefined;
    if (!oldest) break;
    attempts.delete(oldest);
  }
}

export async function POST(request: Request) {
  const body = await readJsonBody<{ username?: string; password?: string }>(request, 4 * 1024);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });
  const payload = body.value;
  const username = payload.username?.trim() || "unknown";
  if (username.length > 32 || (payload.password?.length ?? 0) > 128) {
    return NextResponse.json({ error: "用户名或密码格式无效" }, { status: 400 });
  }
  const key = username.toLowerCase();
  const now = Date.now();
  cleanupAttempts(now);
  const current = attempts.get(key);
  const state = !current || current.resetAt <= now ? { count: 0, resetAt: now + WINDOW_MS } : current;

  if (state.count >= MAX_ATTEMPTS) return NextResponse.json({ error: "登录尝试过多，请稍后再试。" }, { status: 429 });

  const user = payload.password ? await authenticateAdmin(username, payload.password) : null;
  if (!user) {
    attempts.set(key, { ...state, count: state.count + 1 });
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  attempts.delete(key);
  const response = NextResponse.json({ ok: true, user: { id: user.id, username: user.username } });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionValue(user), adminCookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}
