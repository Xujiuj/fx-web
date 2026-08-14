import "server-only";
import nodemailer from "nodemailer";
import { getHomeContent } from "@/lib/cms-content";
import { prisma } from "@/lib/prisma";

type ContactLeadNotification = {
  id: string;
  name: string;
  company: string | null;
  contact: string;
  email: string;
  message: string;
  createdAt: Date;
};

type DeliveryStatus = "PENDING" | "SENT" | "SKIPPED" | "FAILED";
type DeliveryResult = { status: DeliveryStatus; deliveryId: string };

const emailPattern = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g;
const singleEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function configuredSmtp() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT ?? "465");

  if (!host || !user || !pass || !Number.isInteger(port) || port < 1 || port > 65_535) return null;

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user, pass },
    from: process.env.SMTP_FROM?.trim() || user
  };
}

function recipientEmails(contactDescription: string) {
  return [...new Set(contactDescription.match(emailPattern) ?? [])];
}

function notificationSubject(lead: ContactLeadNotification) {
  return `网站新咨询：${lead.name}`;
}

function submittedAt(lead: ContactLeadNotification) {
  return lead.createdAt.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
}

function internalNotificationText(lead: ContactLeadNotification) {
  return [
    "收到一条新的线上咨询。",
    `联系人：${lead.name}`,
    `企业名称：${lead.company ?? "未填写"}`,
    `联系电话/微信：${lead.contact}`,
    `联系邮箱：${lead.email || "未填写"}`,
    `提交时间：${submittedAt(lead)}`,
    "",
    "企业需求：",
    lead.message
  ].join("\n");
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown mail delivery error";
  return message.replace(/(password|pass|token|authorization)\s*[:=]\s*\S+/gi, "$1=[REDACTED]").slice(0, 1_000);
}

export async function sendContactLeadNotification(lead: ContactLeadNotification): Promise<DeliveryResult> {
  const recipients = recipientEmails((await getHomeContent()).contact.description);
  const smtp = configuredSmtp();
  const sender = smtp?.from;
  const subject = notificationSubject(lead);
  const delivery = await prisma.contactLeadEmailDelivery.create({
    data: {
      leadId: lead.id,
      recipients: recipients.join(", "),
      sender,
      subject,
      status: "PENDING"
    }
  });

  if (!smtp) {
    await prisma.contactLeadEmailDelivery.update({
      where: { id: delivery.id },
      data: { status: "SKIPPED", error: "SMTP is not configured." }
    });
    return { status: "SKIPPED", deliveryId: delivery.id };
  }

  if (recipients.length === 0) {
    await prisma.contactLeadEmailDelivery.update({
      where: { id: delivery.id },
      data: { status: "SKIPPED", error: "No recipient is configured in the site contact content." }
    });
    return { status: "SKIPPED", deliveryId: delivery.id };
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth
  });

  try {
    const result = await transporter.sendMail({
      from: sender,
      to: recipients,
      replyTo: singleEmailPattern.test(lead.email) ? lead.email : undefined,
      subject,
      text: internalNotificationText(lead)
    });
    await prisma.contactLeadEmailDelivery.update({
      where: { id: delivery.id },
      data: { status: "SENT", providerMessageId: result.messageId, sentAt: new Date() }
    });
    return { status: "SENT", deliveryId: delivery.id };
  } catch (error) {
    await prisma.contactLeadEmailDelivery.update({
      where: { id: delivery.id },
      data: { status: "FAILED", error: errorMessage(error) }
    });
    return { status: "FAILED", deliveryId: delivery.id };
  }
}
