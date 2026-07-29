import { AdminContentPage } from "@/components/admin-content-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "菜单管理 - 峰行智成" };

export default function MenuAdminPage() {
  return <AdminContentPage resource="menu" />;
}
