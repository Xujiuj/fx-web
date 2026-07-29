import { redirect } from "next/navigation";
import { AdminMenuPageManager } from "@/components/admin-menu-page-manager";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getLinkedPageSlugs } from "@/lib/admin-page-menu";
import { getSiteContentBundle } from "@/lib/cms-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "页面管理 - 峰行智成" };

export default async function PagesAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const content = await getSiteContentBundle();
  const linkedPageCounts = content.home.navItems.map((item) => getLinkedPageSlugs(item).filter((slug) => content.subpages.some((page) => page.slug === slug)).length);
  return <AdminMenuPageManager items={content.home.navItems} linkedPageCounts={linkedPageCounts} />;
}
