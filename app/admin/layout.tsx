import { AdminProvider } from "@/components/admin-provider";
import { AdminShell } from "@/components/admin-shell";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AntdRegistry><AdminProvider><AdminShell>{children}</AdminShell></AdminProvider></AntdRegistry>;
}
