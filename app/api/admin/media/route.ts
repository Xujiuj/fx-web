import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, open, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import Busboy from "busboy";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const maxDuration = 1800;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024;
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
const allowedVideoTypes = new Map([
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["video/quicktime", ".mov"],
  ["video/x-msvideo", ".avi"],
  ["video/x-matroska", ".mkv"],
]);

class UploadValidationError extends Error {}

function hasAllowedImageSignature(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (type === "image/gif") return bytes.length >= 6 && (new TextDecoder().decode(bytes.slice(0, 6)) === "GIF87a" || new TextDecoder().decode(bytes.slice(0, 6)) === "GIF89a");
  if (type === "image/webp") return bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}

function hasAllowedVideoSignature(bytes: Uint8Array, type: string) {
  if (type === "video/mp4" || type === "video/quicktime") return bytes.length >= 12 && new TextDecoder().decode(bytes.slice(4, 8)) === "ftyp";
  if (type === "video/webm" || type === "video/x-matroska") return bytes.length >= 4 && bytes.slice(0, 4).every((byte, index) => byte === [0x1a, 0x45, 0xdf, 0xa3][index]);
  if (type === "video/x-msvideo") return bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "AVI ";
  return false;
}

function isVideoUpload(request: Request) {
  return new URL(request.url).searchParams.get("kind") === "video";
}

async function readPrefix(filePath: string) {
  const handle = await open(filePath, "r");
  try {
    const bytes = new Uint8Array(12);
    const { bytesRead } = await handle.read(bytes, 0, bytes.length, 0);
    return bytes.slice(0, bytesRead);
  } finally {
    await handle.close();
  }
}

async function receiveVideoUpload(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_VIDEO_SIZE + 64 * 1024) throw new UploadValidationError("视频文件大小必须在 2GB 以内");
  if (!request.body) throw new UploadValidationError("视频上传数据无效");

  const temporaryDirectory = path.join(tmpdir(), "fx-web-video-upload");
  await mkdir(temporaryDirectory, { recursive: true });
  let upload: Promise<{ path: string; mimeType: string }> | undefined;
  let validationError: UploadValidationError | undefined;
  let receivedFile = false;
  const parser = Busboy({
    headers: Object.fromEntries(request.headers.entries()),
    limits: { files: 1, fields: 0, fileSize: MAX_VIDEO_SIZE },
  });

  parser.on("file", (fieldName, stream, info) => {
    if (receivedFile || fieldName !== "file") {
      validationError ??= new UploadValidationError("只能上传一个视频文件");
      stream.resume();
      return;
    }
    receivedFile = true;
    const extension = allowedVideoTypes.get(info.mimeType);
    if (!extension) {
      validationError = new UploadValidationError("仅支持 MP4、WebM、MOV、AVI 和 MKV 视频文件");
      stream.resume();
      return;
    }

    const temporaryPath = path.join(temporaryDirectory, `${randomUUID()}${extension}`);
    upload = new Promise((resolve, reject) => {
      const writer = createWriteStream(temporaryPath, { flags: "wx" });
      let exceededSizeLimit = false;
      stream.on("limit", () => { exceededSizeLimit = true; });
      stream.once("error", reject);
      writer.once("error", reject);
      writer.once("finish", () => {
        if (exceededSizeLimit) {
          void rm(temporaryPath, { force: true });
          reject(new UploadValidationError("视频文件大小必须在 2GB 以内"));
          return;
        }
        resolve({ path: temporaryPath, mimeType: info.mimeType });
      });
      stream.pipe(writer);
    });
  });

  await finished(Readable.fromWeb(request.body as unknown as import("node:stream/web").ReadableStream).pipe(parser));
  if (validationError) throw validationError;
  if (!upload) throw new UploadValidationError("请选择需要上传的视频文件");
  return upload;
}

async function transcodeVideo(inputPath: string, outputPath: string) {
  await new Promise<void>((resolve, reject) => {
    const process = spawn("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y", "-i", inputPath,
      "-map", "0:v:0", "-map", "0:a?",
      "-vf", "scale=w='min(1920,iw)':h=-2:force_original_aspect_ratio=decrease",
      "-c:v", "libx264", "-preset", "medium", "-crf", "23",
      "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
      outputPath,
    ], { stdio: "ignore" });
    process.once("error", () => reject(new Error("视频转码服务不可用")));
    process.once("close", (code) => code === 0 ? resolve() : reject(new Error("视频转码失败，请确认文件可以正常播放")));
  });
}

async function handleVideoUpload(request: Request) {
  const uploaded = await receiveVideoUpload(request);
  const outputDirectory = path.join(process.cwd(), "public", "media", "videos");
  const outputFilename = `${randomUUID()}.mp4`;
  const outputPath = path.join(outputDirectory, outputFilename);
  try {
    const signature = await readPrefix(uploaded.path);
    if (!hasAllowedVideoSignature(signature, uploaded.mimeType)) throw new UploadValidationError("视频文件格式无效");
    await mkdir(outputDirectory, { recursive: true });
    await transcodeVideo(uploaded.path, outputPath);
    return NextResponse.json({ path: `/media/videos/${outputFilename}` });
  } catch (error) {
    await rm(outputPath, { force: true });
    throw error;
  } finally {
    await rm(uploaded.path, { force: true });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "请求格式必须为 multipart/form-data" }, { status: 400 });
  }

  if (isVideoUpload(request)) {
    try {
      return await handleVideoUpload(request);
    } catch (error) {
      const message = error instanceof Error ? error.message : "视频上传失败";
      return NextResponse.json({ error: message }, { status: 400 });
    }
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

  const directoryName = documentExtension ? "documents" : "uploads";
  const directory = path.join(process.cwd(), "public", "media", directoryName);
  await mkdir(directory, { recursive: true });
  const filename = randomUUID() + (extension ?? documentExtension);
  await writeFile(path.join(directory, filename), bytes);

  return NextResponse.json({ path: `/media/${directoryName}/${filename}` });
}
