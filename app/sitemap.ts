import type { MetadataRoute } from "next";
import { defaultSubpages } from "@/lib/cms-content";
import { knowledgeEntries as defaultKnowledgeEntries } from "@/lib/knowledge-content";

const siteUrl = "https://fengxingzhicheng.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const subpages: MetadataRoute.Sitemap = defaultSubpages.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    changeFrequency: "weekly",
    priority: page.slug === "knowledge-center" ? 0.9 : 0.8,
  }));
  const knowledgeEntries: MetadataRoute.Sitemap = defaultKnowledgeEntries.map((entry) => ({
    url: `${siteUrl}/knowledge-center/${entry.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...subpages,
    ...knowledgeEntries,
  ];
}
