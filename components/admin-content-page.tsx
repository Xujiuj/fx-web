import { redirect } from "next/navigation";
import { AdminContentResource, type AdminContentResourceName } from "@/components/admin-content-resource";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSiteContentBundle } from "@/lib/cms-content";

export async function AdminContentPage({ resource }: { resource?: AdminContentResourceName }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <AdminContentResource resource={resource} initialContent={await getSiteContentBundle()} />;
}
