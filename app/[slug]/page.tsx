import { SiteHeader } from "@/components/site-header";
import { SubpageShell } from "@/components/subpage-shell";
import { SiteFooter } from "@/components/site-footer";
import { defaultSubpages, getHomeContent, getKnowledgeEntries, getSubpageContent } from "@/lib/cms-content";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return defaultSubpages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [home, page] = await Promise.all([getHomeContent(), getSubpageContent(slug)]);
  if (!page) notFound();
  return {
    title: `${page.title} - ${home.brand.name}`,
    description: page.summary
  };
}

export default async function Subpage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [home, page, knowledgeEntries] = await Promise.all([getHomeContent(), getSubpageContent(slug), getKnowledgeEntries()]);
  if (!page) notFound();

  return (
    <>
      <SiteHeader content={home} />
      <SubpageShell page={page} knowledgeEntries={knowledgeEntries} />
      <SiteFooter footer={home.footer} />
    </>
  );
}
