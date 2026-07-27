import { HomePage } from "@/components/home-page";
import { SiteHeader } from "@/components/site-header";
import { getHomeContent } from "@/lib/cms-content";

export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await getHomeContent();

  return (
    <>
      <SiteHeader content={content} />
      <HomePage content={content} />
    </>
  );
}
