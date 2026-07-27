"use client";

import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider } from "antd";

export function AdminProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider theme={{ token: { colorPrimary: "#1677ff", borderRadius: 6, fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif" }, components: { Layout: { headerBg: "#ffffff", siderBg: "#001529" } } }}>{children}</ConfigProvider>;
}
