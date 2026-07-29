"use client";

import { useState } from "react";
import { App, Button, Popconfirm, Tag, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ModalForm, PageContainer, ProFormText, ProTable, type ProColumns } from "@ant-design/pro-components";

export type AdminUserView = {
  id: string;
  username: string;
  disabled: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type UserFormValues = { username: string; password?: string };

export function AdminUserManager({ initialUsers, currentUserId }: { initialUsers: AdminUserView[]; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserView | null>(null);
  const [busy, setBusy] = useState(false);
  const { message } = App.useApp();

  async function request(method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "操作失败");
      return result;
    } finally {
      setBusy(false);
    }
  }

  function openCreateForm() {
    setEditing(null);
    setOpen(true);
  }

  function openEditForm(user: AdminUserView) {
    setEditing(user);
    setOpen(true);
  }

  async function saveUser(values: UserFormValues) {
    try {
      if (editing) {
        const result = await request("PATCH", { id: editing.id, username: values.username, password: values.password || undefined });
        setUsers((current) => current.map((user) => user.id === editing.id ? result.user : user));
      } else {
        const result = await request("POST", { username: values.username, password: values.password });
        setUsers((current) => [...current, result.user]);
      }
      message.success(editing ? "账号已更新。" : "账号已创建。");
      setOpen(false);
      return true;
    } catch (error) {
      message.error(error instanceof Error ? error.message : "账号保存失败");
      return false;
    }
  }

  async function deleteUser(user: AdminUserView) {
    try {
      await request("DELETE", { id: user.id });
      setUsers((current) => current.filter((item) => item.id !== user.id));
      message.success("账号已删除。");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "账号删除失败");
    }
  }

  const columns: ProColumns<AdminUserView>[] = [
    { title: "用户名", dataIndex: "username" },
    {
      title: "状态",
      dataIndex: "disabled",
      valueType: "select",
      valueEnum: {
        false: { text: "可用", status: "Success" },
        true: { text: "已停用", status: "Default" }
      },
      render: (_, user) => <Tag color={user.id === currentUserId ? "blue" : user.disabled ? "default" : "green"}>{user.id === currentUserId ? "当前用户" : user.disabled ? "已停用" : "可用"}</Tag>
    },
    { title: "创建时间", dataIndex: "createdAt", valueType: "dateTime", search: false },
    {
      title: "操作",
      valueType: "option",
      width: 112,
      render: (_, user) => [
        <Tooltip key="edit" title="编辑账号"><Button type="text" icon={<EditOutlined />} aria-label="编辑账号" onClick={() => openEditForm(user)} /></Tooltip>,
        user.id !== currentUserId ? <Popconfirm key="delete" title="确认删除此账号？" description="删除后无法恢复。" okText="删除" cancelText="取消" okButtonProps={{ danger: true, loading: busy }} onConfirm={() => deleteUser(user)}><Tooltip title="删除账号"><Button danger type="text" icon={<DeleteOutlined />} aria-label="删除账号" /></Tooltip></Popconfirm> : null
      ]
    }
  ];

  return <PageContainer title="账号管理" content="管理后台登录账号；至少保留一个可用账号。"><ProTable<AdminUserView> rowKey="id" headerTitle="管理员账号" dataSource={users} columns={columns} search={false} loading={busy} options={{ density: true, fullScreen: true, reload: false, setting: true }} toolBarRender={() => [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>新增账号</Button>]} /><ModalForm<UserFormValues> key={editing?.id ?? "new"} title={editing ? "编辑账号" : "新增账号"} open={open} initialValues={editing ?? undefined} modalProps={{ destroyOnHidden: true, onCancel: () => setOpen(false) }} submitter={{ submitButtonProps: { loading: busy } }} onFinish={saveUser}><ProFormText name="username" label="用户名" rules={[{ required: true, min: 3, max: 32 }]} /><ProFormText.Password name="password" label={editing ? "新密码（留空不修改）" : "初始密码"} rules={editing ? [] : [{ required: true, min: 10, max: 128 }]} /></ModalForm></PageContainer>;
}
