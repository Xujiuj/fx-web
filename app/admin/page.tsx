import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSiteContentBundle } from "@/lib/cms-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "管理工作台 - 峰行智成" };

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const content = await getSiteContentBundle();
  const cards = [
    { title: "前台导航", value: content.home.navItems.length, suffix: "项", href: "/admin/site/menu" },
    { title: "业务内容", value: content.home.solutionItems.length + content.home.newsItems.length, suffix: "条", href: "/admin/business/solutions" },
    { title: "独立页面", value: content.subpages.length, suffix: "页", href: "/admin/pages" }
  ];
  return <AdminDashboard cards={cards} />;
}
