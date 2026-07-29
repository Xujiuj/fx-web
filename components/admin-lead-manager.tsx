"use client";

import { PageContainer, ProTable, type ProColumns } from "@ant-design/pro-components";

type ContactLead = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  message: string;
  createdAt: string | Date;
};

export function AdminLeadManager() {
  const columns: ProColumns<ContactLead>[] = [
    { title: "提交时间", dataIndex: "createdAt", valueType: "dateTime", width: 180 },
    { title: "联系人", dataIndex: "name", width: 120 },
    { title: "企业", dataIndex: "company", renderText: (company) => company || "-", width: 160 },
    { title: "邮箱", dataIndex: "email", width: 220 },
    { title: "咨询内容", dataIndex: "message", ellipsis: true }
  ];

  return <PageContainer title="咨询记录" content="查看首页咨询表单提交的信息。"><ProTable<ContactLead>
    rowKey="id"
    headerTitle="首页咨询提交"
    search={false}
    columns={columns}
    pagination={{ pageSize: 20, showSizeChanger: true }}
    options={{ density: true, fullScreen: true, reload: true, setting: true }}
    request={async ({ current = 1, pageSize = 20 }) => {
      const response = await fetch(`/api/leads?page=${current}&pageSize=${pageSize}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "咨询记录加载失败");
      return { data: result.leads, success: true, total: result.total };
    }}
  /></PageContainer>;
}
