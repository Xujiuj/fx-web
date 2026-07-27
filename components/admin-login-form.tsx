"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

export function AdminLoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(values: { username: string; password: string }) { setLoading(true); setError(""); const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); if (response.ok) { router.replace("/admin"); router.refresh(); return; } const result = await response.json(); setError(result.error || "登录失败"); setLoading(false); }
  return <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#f0f2f5", padding: 24 }}><Card style={{ width: 400, boxShadow: "0 8px 30px rgba(0,0,0,.08)" }}><Space direction="vertical" size="large" style={{ width: "100%" }}><Image src="/media/fengxing-logo.png" alt="峰行智成" width={99} height={50} priority /><div><Typography.Title level={3} style={{ margin: 0 }}>管理后台登录</Typography.Title><Typography.Text type="secondary">使用管理员账号进入内容管理台</Typography.Text></div>{error ? <Alert type="error" message={error} showIcon /> : null}<Form layout="vertical" onFinish={submit}><Form.Item name="username" label="用户名" rules={[{ required: true }]}><Input prefix={<UserOutlined />} autoComplete="username" /></Form.Item><Form.Item name="password" label="密码" rules={[{ required: true }]}><Input.Password prefix={<LockOutlined />} autoComplete="current-password" /></Form.Item><Button htmlType="submit" type="primary" block loading={loading}>登录</Button></Form><Link href="/">返回前台</Link></Space></Card></div>;
}
