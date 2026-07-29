"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Space } from "antd";
import { ProLayout, type MenuDataItem } from "@ant-design/pro-components";
import {
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  TeamOutlined
} from "@ant-design/icons";

const menuData: MenuDataItem[] = [
  { path: "/admin/content", name: "站点内容", icon: <FileTextOutlined /> },
  { path: "/admin/content/menu", name: "菜单管理", icon: <MenuOutlined /> },
  { path: "/admin/content/pages", name: "页面管理", icon: <FileTextOutlined /> },
  { path: "/admin/system/users", name: "账号管理", icon: <TeamOutlined /> }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <ProLayout
      title="峰行智成后台"
      logo={<Image src="/media/fengxing-logo.png" alt="峰行智成" width={99} height={50} style={{ width: "auto", height: 40 }} priority />}
      location={{ pathname }}
      route={{ routes: menuData }}
      menuDataRender={() => menuData}
      menuItemRender={(item, dom) => item.path ? <Link href={item.path}>{dom}</Link> : dom}
      rightContentRender={() => <Space><Button type="link" href="/" target="_blank">查看前台</Button><Button type="text" icon={<LogoutOutlined />} onClick={logout}>退出</Button></Space>}
      layout="side"
      contentWidth="Fluid"
      fixedHeader
    >
      {children}
    </ProLayout>
  );
}
