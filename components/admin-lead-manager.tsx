"use client";

import { PageContainer, ProTable, type ProColumns } from "@ant-design/pro-components";
import { Tag, Tooltip } from "antd";

type ContactLead = {
  id: string;
  name: string;
  company: string | null;
  contact: string;
  email: string;
  message: string;
  createdAt: string | Date;
  mailDeliveries: MailDelivery[];
};

type MailDelivery = {
  id: string;
  recipients: string;
  sender: string | null;
  subject: string;
  status: "PENDING" | "SENT" | "SKIPPED" | "FAILED";
  error: string | null;
  providerMessageId: string | null;
  sentAt: string | Date | null;
  createdAt: string | Date;
};

const deliveryStatus = {
  PENDING: { label: "发送中", color: "processing" },
  SENT: { label: "已发送", color: "success" },
  SKIPPED: { label: "未发送", color: "default" },
  FAILED: { label: "发送失败", color: "error" }
} as const;

function formatDate(value: string | Date | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) : "-";
}

export function AdminLeadManager() {
  const columns: ProColumns<ContactLead>[] = [
    { title: "提交时间", dataIndex: "createdAt", valueType: "dateTime", width: 180 },
    { title: "联系人", dataIndex: "name", width: 120 },
    { title: "企业", dataIndex: "company", renderText: (company) => company || "-", width: 160 },
    { title: "手机号/微信号", dataIndex: "contact", width: 180 },
    { title: "邮箱", dataIndex: "email", width: 220 },
    {
      title: "邮件投递",
      dataIndex: "mailDeliveries",
      width: 150,
      render: (_, lead) => {
        const latest = lead.mailDeliveries[0];
        if (!latest) return "-";
        const state = deliveryStatus[latest.status];
        const details = [
          `状态：${state.label}`,
          `收件人：${latest.recipients || "-"}`,
          `发件人：${latest.sender || "-"}`,
          `主题：${latest.subject}`,
          `发起时间：${formatDate(latest.createdAt)}`,
          `成功时间：${formatDate(latest.sentAt)}`,
          latest.providerMessageId ? `邮件编号：${latest.providerMessageId}` : null,
          latest.error ? `失败原因：${latest.error}` : null,
          lead.mailDeliveries.length > 1 ? `历史记录：${lead.mailDeliveries.length} 次` : null
        ].filter(Boolean).join("\n");
        return <Tooltip title={<span style={{ whiteSpace: "pre-line" }}>{details}</span>}><Tag color={state.color}>{state.label}</Tag></Tooltip>;
      }
    },
    { title: "咨询内容", dataIndex: "message", ellipsis: true }
  ];

  return <PageContainer title="咨询记录" content="查看首页咨询表单提交的信息。"><ProTable<ContactLead>
    rowKey="id"
    headerTitle="首页咨询提交"
    search={false}
    scroll={{ x: "max-content" }}
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
