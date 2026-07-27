"use client";

import { useState } from "react";
import { Button, Modal, Popconfirm, Space, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm, ProFormText, ProTable, type ProColumns } from "@ant-design/pro-components";
import { AdminShell } from "@/components/admin-shell";

export type AdminUserView = { id: string; username: string; disabled: boolean; createdAt: string | Date; updatedAt: string | Date };

export function AdminUserManager({ initialUsers, currentUserId }: { initialUsers: AdminUserView[]; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserView | null>(null);
  const [busy, setBusy] = useState(false);
  async function request(method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) {
    setBusy(true); const response = await fetch("/api/admin/users", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const result = await response.json(); setBusy(false); if (!response.ok) throw new Error(result.error || "操作失败"); return result;
  }
  const columns: ProColumns<AdminUserView>[] = [{ title: "用户名", dataIndex: "username" }, { title: "状态", dataIndex: "disabled", valueType: "select", valueEnum: { false: { text: "可用", status: "Success" }, true: { text: "已停用", status: "Default" } }, render: (_, record) => <Tag color={record.id === currentUserId ? "blue" : record.disabled ? "default" : "green"}>{record.id === currentUserId ? "当前用户" : record.disabled ? "已停用" : "可用"}</Tag> }, { title: "创建时间", dataIndex: "createdAt", valueType: "dateTime", search: false }, { title: "操作", valueType: "option", render: (_, record) => [<Button key="edit" type="link" size="small" onClick={() => { setEditing(record); setOpen(true); }}>编辑</Button>, record.id !== currentUserId ? <Popconfirm key="delete" title="确认删除此账号？" onConfirm={async () => { const result = await request("DELETE", { id: record.id }); if (result) setUsers((current) => current.filter((item) => item.id !== record.id)); }}><Button danger type="link" size="small">删除</Button></Popconfirm> : null] }];
  return <AdminShell><div style={{ padding: 24 }}><ProTable<AdminUserView> rowKey="id" headerTitle="账号管理" dataSource={users} columns={columns} search={false} loading={busy} options={{ density: true, fullScreen: true, setting: true }} toolBarRender={() => [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setOpen(true); }}>新增账号</Button>]} /><ModalForm key={editing?.id ?? "new"} title={editing ? "编辑账号" : "新增账号"} open={open} initialValues={editing ?? undefined} modalProps={{ destroyOnHidden: true, onCancel: () => setOpen(false) }} submitter={{ submitButtonProps: { loading: busy } }} onFinish={async (values) => { if (editing) { const result = await request("PATCH", { id: editing.id, username: values.username, password: values.password || undefined }); setUsers((current) => current.map((item) => item.id === editing.id ? result.user : item)); } else { const result = await request("POST", { username: values.username, password: values.password }); setUsers((current) => [...current, result.user]); } setOpen(false); return true; }}><ProFormText name="username" label="用户名" rules={[{ required: true, min: 3, max: 32 }]} /><ProFormText.Password name="password" label={editing ? "新密码（留空不修改）" : "初始密码"} rules={editing ? [] : [{ required: true, min: 10, max: 128 }]} /></ModalForm></div></AdminShell>;
}
