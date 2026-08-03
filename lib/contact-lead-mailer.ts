import "server-only";
import nodemailer from "nodemailer";
import { getHomeContent } from "@/lib/cms-content";

type ContactLeadNotification = {
  id: string;
  name: string;
  company: string | null;
  contact: string;
  email: string;
  message: string;
  createdAt: Date;
};

type DeliveryResult = "sent" | "not-configured" | "no-recipient";

const emailPattern = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g;

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

export async function sendContactLeadNotification(lead: ContactLeadNotification): Promise<DeliveryResult> {
  const smtp = configuredSmtp();
  if (!smtp) return "not-configured";

  const recipients = recipientEmails((await getHomeContent()).contact.description);
  if (recipients.length === 0) return "no-recipient";

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth
  });

  await transporter.sendMail({
    from: smtp.from,
    to: recipients,
    replyTo: lead.email,
    subject: `网站新咨询：${lead.name}`,
    text: [
      "收到一条新的线上咨询。",
      `联系人：${lead.name}`,
      `企业名称：${lead.company ?? "未填写"}`,
      `联系电话/微信：${lead.contact}`,
      `联系邮箱：${lead.email}`,
      `提交时间：${lead.createdAt.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}`,
      "",
      "企业需求：",
      lead.message
    ].join("\n")
  });

  return "sent";
}
