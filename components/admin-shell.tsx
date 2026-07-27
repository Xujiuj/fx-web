"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Space } from "antd";
import { ProLayout, type MenuDataItem } from "@ant-design/pro-components";
import {
  AppstoreOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MenuOutlined,
  ProductOutlined,
  SettingOutlined,
  TeamOutlined
} from "@ant-design/icons";

const menuData: MenuDataItem[] = [
  { path: "/admin", name: "工作台", icon: <AppstoreOutlined /> },
  {
    path: "/admin/site", name: "站点管理", icon: <GlobalOutlined />,
    children: [
      { path: "/admin/site/brand", name: "品牌信息", icon: <ApartmentOutlined /> },
      { path: "/admin/site/menu", name: "菜单管理", icon: <MenuOutlined /> },
      { path: "/admin/site/home", name: "首页内容", icon: <FileTextOutlined /> }
    ]
  },
  {
    path: "/admin/business", name: "业务内容", icon: <ProductOutlined />,
    children: [
      { path: "/admin/business/solutions", name: "解决方案与动态", icon: <FileTextOutlined /> },
      { path: "/admin/business/products", name: "产品中心", icon: <ProductOutlined /> }
    ]
  },
  { path: "/admin/assets/proof", name: "资质与伙伴", icon: <FileTextOutlined /> },
  { path: "/admin/pages", name: "页面管理", icon: <FileTextOutlined /> },
  { path: "/admin/system/users", name: "账号管理", icon: <TeamOutlined /> },
  { path: "/admin/system", name: "系统设置", icon: <SettingOutlined />, hideInMenu: true }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() { await fetch("/api/admin/session", { method: "DELETE" }); router.replace("/admin/login"); router.refresh(); }
  return <ProLayout title="峰行智成后台" logo={<Image src="/media/fengxing-logo.png" alt="峰行智成" width={99} height={50} style={{ width: "auto", height: 40 }} priority />} location={{ pathname }} route={{ routes: menuData }} menuDataRender={() => menuData} menuItemRender={(item, dom) => item.path ? <Link href={item.path}>{dom}</Link> : dom} rightContentRender={() => <Space><Button type="link" href="/" target="_blank">查看前台</Button><Button type="text" icon={<LogoutOutlined />} onClick={logout}>退出</Button></Space>} layout="side" contentWidth="Fluid" fixedHeader>{children}</ProLayout>;
}
