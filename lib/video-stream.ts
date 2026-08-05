export type VideoByteRange = { start: number; end: number };

/** Returns null for a full response and false for an unsatisfiable Range header. */
export function parseVideoByteRange(value: string | null, size: number): VideoByteRange | null | false {
  if (!value) return null;
  if (!Number.isSafeInteger(size) || size <= 0) return false;

  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return false;

  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return false;
    return { start: Math.max(0, size - suffixLength), end: size - 1 };
  }

  const start = Number(match[1]);
  if (!Number.isSafeInteger(start) || start < 0 || start >= size) return false;
  if (!match[2]) return { start, end: size - 1 };

  const requestedEnd = Number(match[2]);
  if (!Number.isSafeInteger(requestedEnd) || requestedEnd < start) return false;
  return { start, end: Math.min(requestedEnd, size - 1) };
}
