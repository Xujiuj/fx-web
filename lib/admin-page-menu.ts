import type { NavItem } from "@/lib/cms-content";

export function getLinkedPageSlugs(item: Pick<NavItem, "href" | "children">): string[] {
  const hrefs = [item.href, ...(item.children?.map((child) => child.href) ?? [])];
  return [...new Set(hrefs
    .map((href) => href.split(/[?#]/, 1)[0])
    .filter((href) => href.startsWith("/") && href.length > 1)
    .map((href) => href.slice(1)))];
}
