import { redirect } from "next/navigation";
import { AdminContentResource } from "@/components/admin-content-resource";
import { AdminShell } from "@/components/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSiteContentBundle } from "@/lib/cms-content";

export const dynamic = "force-dynamic";
export default async function SolutionsAdminPage() { if (!(await isAdminAuthenticated())) redirect("/admin/login"); return <AdminShell><AdminContentResource resource="solutions" initialContent={await getSiteContentBundle()} /></AdminShell>; }
