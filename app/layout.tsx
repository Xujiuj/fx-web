import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "峰行智成｜企业碳管理数字化服务商",
  description: "新疆峰行智成数据科技有限责任公司，提供温室气体核算、碳管理体系建设、Excel 核算工具与企业碳管理数字化服务。"
};

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
