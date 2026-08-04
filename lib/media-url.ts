const localOrigin = "https://fengxing.invalid";
const runtimeImagePrefix = "/media/uploads/";
const managedPathPattern = /^\/media\/(uploads|documents|videos)\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-z0-9]+$/i;

export function isLocalContentPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f\u007f\s]/.test(value)) return false;
  try {
    return new URL(value, localOrigin).origin === localOrigin;
  } catch {
    return false;
  }
}

export function isHttpsContentUrl(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isAllowedContentHref(value: unknown) {
  return isLocalContentPath(value) || isHttpsContentUrl(value);
}

export function isOptionalAllowedContentHref(value: unknown) {
  return value === undefined || value === "" || isAllowedContentHref(value);
}

export function getManagedMediaPath(src?: string | null) {
  if (!src?.startsWith("/") || src.startsWith("//")) return null;
  try {
    const url = new URL(src, localOrigin);
    return url.origin === localOrigin && managedPathPattern.test(url.pathname) ? url.pathname : null;
  } catch {
    return null;
  }
}

export function isRuntimeManagedImage(src?: string | null) {
  return Boolean(getManagedMediaPath(src)?.startsWith(runtimeImagePrefix));
}
