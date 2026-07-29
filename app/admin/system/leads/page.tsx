import { redirect } from "next/navigation";
import { AdminLeadManager } from "@/components/admin-lead-manager";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "咨询记录 - 峰行智成" };

export default async function AdminSystemLeadsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <AdminLeadManager />;
}
