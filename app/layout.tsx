import type { Metadata } from "next";
import "./globals.css";
import { getHomeContent } from "@/lib/cms-content";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomeContent();
  return { title: content.site.title, description: content.site.description };
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        {children}
        <noscript>
          <style>{".reference-page .page-reveal, .reference-page [data-motion], .reference-page [data-motion-role], .capability-orbit-section .timeline-section-heading, .capability-orbit-track, .capability-orbit-sweep, .capability-orbit-core, .capability-orbit-stage, .capability-orbit-section .timeline-summary, .site-footer > * { visibility: visible !important; opacity: 1 !important; transform: none !important; } .latest-update-drawer { display: none !important; }"}</style>
        </noscript>
      </body>
    </html>
  );
}
