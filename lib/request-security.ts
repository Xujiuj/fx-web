type JsonBodyResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export async function readJsonBody<T>(request: Request, maxBytes: number): Promise<JsonBodyResult<T>> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return { ok: false, error: "请求格式必须为 JSON" };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, error: "请求内容过大" };
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maxBytes) {
    return { ok: false, error: "请求内容过大" };
  }

  try {
    const value: unknown = JSON.parse(body);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, error: "请求内容格式无效" };
    }
    return { ok: true, value: value as T };
  } catch {
    return { ok: false, error: "请求内容格式无效" };
  }
}

export function createFixedWindowLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  const maxBuckets = 2_000;

  function cleanup(now: number) {
    for (const [key, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(key);
    }
    while (buckets.size > maxBuckets) {
      const oldest = buckets.keys().next().value as string | undefined;
      if (!oldest) break;
      buckets.delete(oldest);
    }
  }

  return {
    allow(key: string) {
      const now = Date.now();
      cleanup(now);
      const current = buckets.get(key);
      const state = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
      if (state.count >= limit) return false;
      buckets.set(key, { ...state, count: state.count + 1 });
      return true;
    }
  };
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",").at(-1)?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
