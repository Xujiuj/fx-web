import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const ADMIN_COOKIE_NAME = "fx_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateUsername(username: string) {
  return /^[a-zA-Z0-9._-]{3,32}$/.test(username);
}

export function validatePassword(password: string) {
  return password.length >= 10 && password.length <= 128;
}

export function hashAdminPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

function verifyPassword(password: string, salt: string, expectedHash: string) {
  return safeEqual(scryptSync(password, salt, 64).toString("hex"), expectedHash);
}

export async function ensureBootstrapAdmin() {
  if ((await prisma.adminUser.count()) > 0) return;
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !validatePassword(password)) throw new Error("ADMIN_PASSWORD must be at least 10 characters for initial bootstrap");
  const credentials = hashAdminPassword(password);
  await prisma.adminUser.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash: credentials.hash, passwordSalt: credentials.salt }
  });
}

export async function authenticateAdmin(username: string, password: string) {
  await ensureBootstrapAdmin();
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user || user.disabled || !verifyPassword(password, user.passwordSalt, user.passwordHash)) return null;
  return user;
}

export function createAdminSessionValue(user: { id: string; sessionVersion: number }) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = [user.id, expiresAt, user.sessionVersion].join(":");
  return payload + "." + sign(payload);
}

function parseSessionValue(value?: string) {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;
  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!safeEqual(signature, sign(payload))) return null;
  const [id, expiresAt, sessionVersion] = payload.split(":");
  if (!id || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return null;
  return { id, sessionVersion: Number(sessionVersion) };
}

export async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const session = parseSessionValue(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  if (!session) return null;
  const user = await prisma.adminUser.findUnique({ where: { id: session.id } });
  if (!user || user.disabled || user.sessionVersion !== session.sessionVersion) return null;
  return { id: user.id, username: user.username };
}

export async function isAdminAuthenticated() {
  return Boolean(await getAuthenticatedAdmin());
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS
};
