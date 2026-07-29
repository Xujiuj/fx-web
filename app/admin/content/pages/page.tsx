import { AdminContentPage } from "@/components/admin-content-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "页面管理 - 峰行智成" };

export default function PagesAdminPage() {
  return <AdminContentPage resource="navigation" />;
}
