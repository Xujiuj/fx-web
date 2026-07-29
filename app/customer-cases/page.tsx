import type { Metadata } from "next";
import { ManufacturingCasePage } from "@/components/manufacturing-case-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getHomeContent } from "@/lib/cms-content";

export const metadata: Metadata = {
  title: "制造行业案例｜峰行智成",
  description: "峰行智成为制造企业建设温室气体核算、碳数据治理与持续运营能力。"
};

export default async function CustomerCasesPage() {
  const content = await getHomeContent();

  return (
    <>
      <SiteHeader content={content} />
      <ManufacturingCasePage />
      <SiteFooter footer={content.footer} />
    </>
  );
}
