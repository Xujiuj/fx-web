"use client";

import Link from "next/link";
import { Button, Tag } from "antd";
import { FolderOpenOutlined } from "@ant-design/icons";
import { PageContainer, ProTable, type ProColumns } from "@ant-design/pro-components";
import type { NavItem } from "@/lib/cms-content";

type MenuPageRow = NavItem & { id: string; linkedPages: number };

export function AdminMenuPageManager({ items, linkedPageCounts, embedded = false }: { items: NavItem[]; linkedPageCounts: number[]; embedded?: boolean }) {
  const rows: MenuPageRow[] = items.map((item, index) => ({ ...item, id: String(index), linkedPages: linkedPageCounts[index] ?? 0 }));
  const columns: ProColumns<MenuPageRow>[] = [
    { title: "一级菜单", dataIndex: "label" },
    { title: "菜单链接", dataIndex: "href" },
    { title: "二级菜单", dataIndex: "children", renderText: (children) => children?.length ?? 0 },
    { title: "已关联页面", dataIndex: "linkedPages", render: (_, item) => <Tag color={item.linkedPages ? "blue" : "default"}>{item.linkedPages} 个</Tag> },
    { title: "内容管理", valueType: "option", render: (_, item) => <Link href={`/admin/content/pages/${item.id}`}><Button type="link" icon={<FolderOpenOutlined />}>管理栏目页面</Button></Link> }
  ];
  const table = <ProTable<MenuPageRow> rowKey="id" headerTitle="一级菜单栏目" dataSource={rows} columns={columns} search={false} pagination={{ pageSize: 10, showSizeChanger: true }} options={{ density: true, fullScreen: true, reload: false, setting: true }} />;
  return embedded ? table : <PageContainer title="导航与页面" content="按一级菜单分别维护其直属链接和二级菜单对应的页面内容。">{table}</PageContainer>;
}
