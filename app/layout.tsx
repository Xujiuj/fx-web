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
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <noscript>
          <style>{".reference-page .page-reveal { visibility: visible !important; opacity: 1 !important; transform: none !important; }"}</style>
        </noscript>
      </body>
    </html>
  );
}
