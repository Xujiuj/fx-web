import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createFixedWindowLimiter, getClientIp, readJsonBody } from "@/lib/request-security";

const leadLimiter = createFixedWindowLimiter(5, 10 * 60 * 1000);
const MAX_NAME_LENGTH = 80;
const MAX_COMPANY_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parsePositiveInteger(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parsePositiveInteger(searchParams.get("page"), 1, 10_000);
  const pageSize = parsePositiveInteger(searchParams.get("pageSize"), 20, 100);
  const [total, leads] = await prisma.$transaction([
    prisma.contactLead.count(),
    prisma.contactLead.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize })
  ]);

  return NextResponse.json({ leads, page, pageSize, total });
}

export async function POST(request: Request) {
  if (!leadLimiter.allow(getClientIp(request))) {
    return NextResponse.json({ error: "提交过于频繁，请稍后再试。" }, { status: 429 });
  }

  const body = await readJsonBody<{
    name?: string;
    company?: string;
    email?: string;
    message?: string;
  }>(request, 8 * 1024);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });

  const name = body.value.name?.trim();
  const company = body.value.company?.trim();
  const email = body.value.email?.trim().toLowerCase();
  const message = body.value.message?.trim();

  if (
    !name || name.length > MAX_NAME_LENGTH ||
    !email || email.length > 254 || !emailPattern.test(email) ||
    !message || message.length > MAX_MESSAGE_LENGTH ||
    (company !== undefined && company.length > MAX_COMPANY_LENGTH)
  ) {
    return NextResponse.json(
      { error: "请填写有效的姓名、邮箱和留言内容。" },
      { status: 400 }
    );
  }

  const lead = await prisma.contactLead.create({
    data: {
      name,
      company: company || null,
      email,
      message
    }
  });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
