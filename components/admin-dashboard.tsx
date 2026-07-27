"use client";

import Link from "next/link";
import { Card, Col, Row, Statistic, Typography } from "antd";
import { AdminShell } from "@/components/admin-shell";

type DashboardCard = { title: string; value: number; suffix: string; href: string };

export function AdminDashboard({ cards }: { cards: DashboardCard[] }) {
  return <AdminShell><div style={{ padding: 24 }}><Typography.Title level={2}>工作台</Typography.Title><Typography.Paragraph type="secondary">通过左侧导航进入对应资源模块，所有内容均以标准化管理表格维护。</Typography.Paragraph><Row gutter={[16, 16]}>{cards.map((card) => <Col xs={24} md={8} key={card.title}><Link href={card.href}><Card hoverable><Statistic title={card.title} value={card.value} suffix={card.suffix} /></Card></Link></Col>)}</Row></div></AdminShell>;
}
