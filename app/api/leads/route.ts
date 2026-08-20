import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendContactLeadNotification } from "@/lib/contact-lead-mailer";
import { prisma } from "@/lib/prisma";
import { createFixedWindowLimiter, getClientIp, readJsonBody } from "@/lib/request-security";

const leadLimiter = createFixedWindowLimiter(5, 10 * 60 * 1000);
const MAX_NAME_LENGTH = 80;
const MAX_COMPANY_LENGTH = 120;
const MAX_CONTACT_LENGTH = 80;
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
  const keyword = searchParams.get("keyword")?.trim().slice(0, 120) ?? "";
  const requestedDeliveryStatus = searchParams.get("deliveryStatus")?.trim() ?? "";
  const deliveryStatus = new Set(["PENDING", "SENT", "SKIPPED", "FAILED"]).has(requestedDeliveryStatus) ? requestedDeliveryStatus : "";
  const keywordWhere = {
    ...(keyword ? {
      OR: ["name", "company", "contact", "email", "message"].map((field) => ({ [field]: { contains: keyword } })),
    } : {}),
  };
  const matchingIds = deliveryStatus
    ? (await prisma.contactLead.findMany({
        where: keywordWhere,
        select: { id: true, mailDeliveries: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } } },
      })).filter((lead) => lead.mailDeliveries[0]?.status === deliveryStatus).map((lead) => lead.id)
    : null;
  const where = matchingIds ? { ...keywordWhere, id: { in: matchingIds } } : keywordWhere;
  const [total, leads] = await prisma.$transaction([
    prisma.contactLead.count({ where }),
    prisma.contactLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { mailDeliveries: { orderBy: { createdAt: "desc" } } }
    })
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
    contact?: string;
    email?: string;
    message?: string;
  }>(request, 8 * 1024);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });

  const name = body.value.name?.trim();
  const company = body.value.company?.trim();
  const contact = body.value.contact?.trim();
  const email = body.value.email?.trim().toLowerCase() ?? "";
  const message = body.value.message?.trim();

  if (
    !name || name.length > MAX_NAME_LENGTH ||
    !contact || contact.length > MAX_CONTACT_LENGTH ||
    email.length > 254 || (email.length > 0 && !emailPattern.test(email)) ||
    !message || message.length > MAX_MESSAGE_LENGTH ||
    (company !== undefined && company.length > MAX_COMPANY_LENGTH)
  ) {
    return NextResponse.json(
      { error: "请填写有效的联系人、手机号或微信号和留言内容；邮箱如填写需使用有效格式。" },
      { status: 400 }
    );
  }

  const lead = await prisma.contactLead.create({
    data: {
      name,
      company: company || null,
      contact,
      email,
      message
    }
  });

  try {
    const delivery = await sendContactLeadNotification(lead);
    if (delivery.status !== "SENT") console.warn("Contact lead notification was not sent", { leadId: lead.id, ...delivery });
  } catch (error) {
    console.error("Contact lead notification failed", {
      leadId: lead.id,
      message: error instanceof Error ? error.message : "Unknown mail delivery error"
    });
  }

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
