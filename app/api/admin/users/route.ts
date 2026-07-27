import { NextResponse } from "next/server";
import {
  getAuthenticatedAdmin,
  hashAdminPassword,
  validatePassword,
  validateUsername
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-security";

class UserRuleError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

async function currentAdmin() {
  return getAuthenticatedAdmin();
}

export async function GET() {
  const current = await currentAdmin();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, username: true, disabled: true, createdAt: true, updatedAt: true }
  });
  return NextResponse.json({ users, currentUserId: current.id });
}

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJsonBody<{ username?: string; password?: string }>(request, 4 * 1024);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });
  const payload = body.value;
  if (!payload.username || !validateUsername(payload.username)) return NextResponse.json({ error: "用户名需为 3-32 位字母、数字、点、下划线或连字符" }, { status: 400 });
  if (!payload.password || !validatePassword(payload.password)) return NextResponse.json({ error: "密码长度需为 10-128 位" }, { status: 400 });
  const credentials = hashAdminPassword(payload.password);
  try {
    const user = await prisma.adminUser.create({
      data: { username: payload.username, passwordHash: credentials.hash, passwordSalt: credentials.salt },
      select: { id: true, username: true, disabled: true, createdAt: true, updatedAt: true }
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  const current = await currentAdmin();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJsonBody<{ id?: string; username?: string; password?: string; disabled?: boolean }>(request, 4 * 1024);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });
  const payload = body.value;
  if (!payload.id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  if (payload.username !== undefined && !validateUsername(payload.username)) return NextResponse.json({ error: "用户名格式无效" }, { status: 400 });
  if (payload.password !== undefined && !validatePassword(payload.password)) return NextResponse.json({ error: "密码长度需为 10-128 位" }, { status: 400 });
  const password = payload.password ? hashAdminPassword(payload.password) : null;

  try {
    const user = await prisma.$transaction(async (tx) => {
      const target = await tx.adminUser.findUnique({ where: { id: payload.id } });
      if (!target) throw new UserRuleError("用户不存在", 404);
      if (payload.disabled === true && payload.id === current.id) throw new UserRuleError("不能停用当前登录用户");
      if (payload.disabled === true && !target.disabled) {
        const enabledCount = await tx.adminUser.count({ where: { disabled: false } });
        if (enabledCount <= 1) throw new UserRuleError("必须保留至少一个可用用户");
      }
      return tx.adminUser.update({
        where: { id: payload.id },
        data: {
          username: payload.username,
          disabled: payload.disabled,
          passwordHash: password?.hash,
          passwordSalt: password?.salt,
          sessionVersion: password || payload.disabled !== undefined ? { increment: 1 } : undefined
        },
        select: { id: true, username: true, disabled: true, createdAt: true, updatedAt: true }
      });
    });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof UserRuleError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "用户名已存在或更新失败" }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const current = await currentAdmin();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJsonBody<{ id?: string }>(request, 4 * 1024);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });
  const payload = body.value;
  if (!payload.id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  if (payload.id === current.id) return NextResponse.json({ error: "不能删除当前登录用户" }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.adminUser.findUnique({ where: { id: payload.id } });
      if (!target) throw new UserRuleError("用户不存在", 404);
      if (!target.disabled) {
        const enabledCount = await tx.adminUser.count({ where: { disabled: false } });
        if (enabledCount <= 1) throw new UserRuleError("必须保留至少一个可用用户");
      }
      await tx.adminUser.delete({ where: { id: payload.id } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UserRuleError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "删除用户失败" }, { status: 409 });
  }
}
