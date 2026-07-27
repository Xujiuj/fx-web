import { redirect } from "next/navigation";
import { AdminUserManager } from "@/components/admin-user-manager";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "账号管理 - 峰行智成" };

export default async function AdminSystemUsersPage() {
  const current = await getAuthenticatedAdmin();
  if (!current) redirect("/admin/login");
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, username: true, disabled: true, createdAt: true, updatedAt: true } });
  return <AdminUserManager initialUsers={users} currentUserId={current.id} />;
}
