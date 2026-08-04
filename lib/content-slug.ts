export const contentSlugPattern = /^(?:[a-z0-9]+-)*[a-z0-9]+$/;

export function isContentSlug(value: unknown): value is string {
  return typeof value === "string" && contentSlugPattern.test(value);
}
