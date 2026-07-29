import { notFound, redirect } from "next/navigation";
import { AdminContentResource } from "@/components/admin-content-resource";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getLinkedPageSlugs } from "@/lib/admin-page-menu";
import { getSiteContentBundle } from "@/lib/cms-content";

export const dynamic = "force-dynamic";

export default async function MenuPagesAdminPage({ params }: { params: Promise<{ menuIndex: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { menuIndex } = await params;
  const index = Number(menuIndex);
  if (!Number.isInteger(index) || index < 0) notFound();

  const content = await getSiteContentBundle();
  const menu = content.home.navItems[index];
  if (!menu) notFound();

  const pageSlugs = getLinkedPageSlugs(menu);
  return <AdminContentResource resource="pages" initialContent={content} pageSlugs={pageSlugs} title={`${menu.label}页面管理`} description={`仅维护“${menu.label}”菜单及其二级菜单链接对应的页面内容。`} />;
}
