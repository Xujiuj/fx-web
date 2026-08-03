import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);
const allowedDocumentTypes = new Map([
  ["application/pdf", ".pdf"],
  ["application/msword", ".doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
  ["application/vnd.ms-excel", ".xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"],
]);

function hasAllowedImageSignature(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (type === "image/gif") return bytes.length >= 6 && (new TextDecoder().decode(bytes.slice(0, 6)) === "GIF87a" || new TextDecoder().decode(bytes.slice(0, 6)) === "GIF89a");
  if (type === "image/webp") return bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "请求格式必须为 multipart/form-data" }, { status: 400 });
  }
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_DOCUMENT_SIZE + 64 * 1024) {
    return NextResponse.json({ error: "文件大小必须在 20MB 以内" }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "图片上传数据无效" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_DOCUMENT_SIZE) return NextResponse.json({ error: "文件大小必须在 20MB 以内" }, { status: 400 });

  const extension = allowedTypes.get(file.type);
  const documentExtension = allowedDocumentTypes.get(file.type);
  if (!extension && !documentExtension) return NextResponse.json({ error: "仅支持 JPG、PNG、WebP、GIF、PDF、Word 和 Excel 文件" }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (extension && (file.size > MAX_IMAGE_SIZE || !hasAllowedImageSignature(bytes, file.type))) {
    return NextResponse.json({ error: "图片文件格式无效" }, { status: 400 });
  }

  const directory = path.join(process.cwd(), "public", "media", documentExtension ? "documents" : "uploads");
  await mkdir(directory, { recursive: true });
  const filename = randomUUID() + (extension ?? documentExtension);
  await writeFile(path.join(directory, filename), bytes);

  return NextResponse.json({ path: `/media/${documentExtension ? "documents" : "uploads"}/${filename}` });
}
