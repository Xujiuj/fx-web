import type { FooterContent } from "@/lib/cms-content";

export function SiteFooter({ footer }: { footer: FooterContent }) {
  return (
    <footer className="site-footer">
      <span>{footer.copyright}</span>
      <a href={footer.icpHref}>{footer.icpText}</a>
      <span>{footer.ipv6Text}</span>
    </footer>
  );
}
