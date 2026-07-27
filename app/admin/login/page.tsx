import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata = { title: "管理后台登录 - 峰行智成" };

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");
  return <AdminLoginForm />;
}
