"use client";

import Link from "next/link";
import { Card, Col, Row, Statistic } from "antd";
import { PageContainer } from "@ant-design/pro-components";

type DashboardCard = { title: string; value: number; suffix: string; href: string };

export function AdminDashboard({ cards }: { cards: DashboardCard[] }) {
  return (
    <PageContainer title="工作台" content="从这里进入站点内容、业务内容和页面配置。">
      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col xs={24} md={8} key={card.title}>
            <Link href={card.href}>
              <Card hoverable>
                <Statistic title={card.title} value={card.value} suffix={card.suffix} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
}
