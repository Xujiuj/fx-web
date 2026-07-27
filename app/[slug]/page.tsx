import { SiteHeader } from "@/components/site-header";
import { SubpageShell } from "@/components/subpage-shell";
import { defaultSubpages, getHomeContent, getSubpageContent } from "@/lib/cms-content";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return defaultSubpages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getSubpageContent(slug);
  return {
    title: page.title + " - 峰行智成",
    description: page.summary
  };
}

export default async function Subpage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [home, page] = await Promise.all([getHomeContent(), getSubpageContent(slug)]);

  return (
    <>
      <SiteHeader content={home} />
      <SubpageShell page={page} />
    </>
  );
}
