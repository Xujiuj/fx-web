import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default function SolutionsAdminPage() { redirect("/admin/content"); }
