"use client";

import { PageContainer, ProTable, type ProColumns } from "@ant-design/pro-components";
import { Empty, Tag, Tooltip } from "antd";

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
    { title: "关键词", dataIndex: "keyword", hideInTable: true, fieldProps: { placeholder: "联系人、企业、联系方式或咨询内容" } },
    { title: "提交时间", dataIndex: "createdAt", valueType: "dateTime", width: 180, search: false },
    { title: "联系人", dataIndex: "name", width: 120, search: false },
    { title: "企业", dataIndex: "company", renderText: (company) => company || "-", width: 160, search: false },
    { title: "手机号/微信号", dataIndex: "contact", width: 180, search: false },
    { title: "邮箱", dataIndex: "email", renderText: (email) => email || "-", width: 220, search: false },
    {
      title: "邮件投递",
      dataIndex: "deliveryStatus",
      width: 150,
      valueType: "select",
      valueEnum: Object.fromEntries(Object.entries(deliveryStatus).map(([value, state]) => [value, { text: state.label, status: state.color }])),
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
    { title: "咨询内容", dataIndex: "message", ellipsis: true, search: false }
  ];

  return <PageContainer title="咨询线索" content="统一查看当前官网联系表单产生的企业咨询及邮件通知状态。"><ProTable<ContactLead>
    rowKey="id"
    headerTitle="官网咨询线索"
    search={{ labelWidth: "auto", defaultCollapsed: false }}
    scroll={{ x: "max-content" }}
    columns={columns}
    pagination={{ pageSize: 20, showSizeChanger: true }}
    options={{ density: true, fullScreen: true, reload: true, setting: true }}
    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无符合条件的咨询线索" /> }}
    request={async ({ current = 1, pageSize = 20, keyword, deliveryStatus: status }) => {
      const params = new URLSearchParams({ page: String(current), pageSize: String(pageSize) });
      if (typeof keyword === "string" && keyword.trim()) params.set("keyword", keyword.trim());
      if (typeof status === "string" && status) params.set("deliveryStatus", status);
      const response = await fetch(`/api/leads?${params.toString()}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "咨询线索加载失败");
      return { data: result.leads, success: true, total: result.total };
    }}
  /></PageContainer>;
}
