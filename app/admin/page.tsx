import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "内容管理 - 峰行智成" };

export default function AdminPage() {
  redirect("/admin/content");
}
