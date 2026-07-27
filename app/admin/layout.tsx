import { AdminProvider } from "@/components/admin-provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AntdRegistry><AdminProvider>{children}</AdminProvider></AntdRegistry>;
}
