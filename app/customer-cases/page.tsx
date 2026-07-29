import type { Metadata } from "next";
import { ManufacturingCasePage } from "@/components/manufacturing-case-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getHomeContent, getSubpageContent } from "@/lib/cms-content";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const [content, page] = await Promise.all([getHomeContent(), getSubpageContent("customer-cases")]);
  if (!page) return { title: content.site.title, description: content.site.description };
  return { title: `${page.title}｜${content.brand.name}`, description: page.summary };
}

export default async function CustomerCasesPage() {
  const [content, page] = await Promise.all([getHomeContent(), getSubpageContent("customer-cases")]);
  if (!page) notFound();

  return (
    <>
      <SiteHeader content={content} />
      <ManufacturingCasePage page={page} />
      <SiteFooter footer={content.footer} />
    </>
  );
}
