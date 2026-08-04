"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Space, Spin } from "antd";
import { ProLayout, type MenuDataItem } from "@ant-design/pro-components";
import {
  FileTextOutlined,
  LogoutOutlined,
  MessageOutlined,
  MenuOutlined,
  TeamOutlined
} from "@ant-design/icons";

const menuData: MenuDataItem[] = [
  { path: "/admin/content", name: "站点内容", icon: <FileTextOutlined /> },
  { path: "/admin/content/pages", name: "导航与页面", icon: <MenuOutlined /> },
  { path: "/admin/system/leads", name: "咨询记录", icon: <MessageOutlined /> },
  { path: "/admin/system/users", name: "账号管理", icon: <TeamOutlined /> }
];

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!mounted) return <div className="admin-pro-shell-loading" aria-busy="true" aria-label="正在加载管理后台"><Spin size="large" /></div>;

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <ProLayout
      title="峰行智成后台"
      logo={<Image src="/media/fengxing-logo-transparent.png" alt="峰行智成" width={99} height={50} style={{ width: "auto", height: 40 }} priority />}
      location={{ pathname }}
      route={{ routes: menuData }}
      menuDataRender={() => menuData}
      menuItemRender={(item, dom) => item.path ? <Link href={item.path}>{dom}</Link> : dom}
      rightContentRender={() => <Space><Button type="link" href="/" target="_blank">查看前台</Button><Button type="text" icon={<LogoutOutlined />} onClick={logout}>退出</Button></Space>}
      layout="side"
      contentWidth="Fluid"
      fixedHeader
    >
      <div className="admin-content-viewport">{children}</div>
    </ProLayout>
  );
}
