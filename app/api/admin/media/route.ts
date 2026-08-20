import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { chmod, mkdir, open, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import Busboy from "busboy";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const maxDuration = 1800;

const ffmpegPath = process.env.FFMPEG_PATH?.trim() || "/usr/bin/ffmpeg";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024;
const MAX_CONCURRENT_VIDEO_JOBS = 1;
const VIDEO_TRANSCODE_TIMEOUT_MS = 28 * 60 * 1000;
const VIDEO_PROCESS_KILL_GRACE_MS = 5 * 1000;
const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);
const allowedDocumentTypes = new Map([
  ["application/pdf", ".pdf"],
  ["application/msword", ".doc"],
  ["application/vnd.ms-powerpoint", ".ppt"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", ".pptx"],
  ["application/vnd.ms-excel", ".xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"],
  ["application/zip", ".zip"],
  ["application/x-7z-compressed", ".7z"],
  ["application/vnd.rar", ".rar"],
  ["application/x-rar-compressed", ".rar"],
  ["application/x-zip-compressed", ".zip"],
]);
const documentTypesByExtension = new Map([
  [".pdf", "application/pdf"],
  [".doc", "application/msword"],
  [".ppt", "application/vnd.ms-powerpoint"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  [".xls", "application/vnd.ms-excel"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  [".zip", "application/zip"],
  [".7z", "application/x-7z-compressed"],
  [".rar", "application/vnd.rar"],
]);
const allowedVideoTypes = new Map([
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["video/quicktime", ".mov"],
  ["video/x-msvideo", ".avi"],
  ["video/x-matroska", ".mkv"],
]);

class MediaRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly logCode: string,
    readonly systemCode?: string,
  ) {
    super(message);
    this.name = "MediaRequestError";
  }
}

class UploadValidationError extends MediaRequestError {
  constructor(message: string) {
    super(message, 400, "VIDEO_UPLOAD_INVALID");
    this.name = "UploadValidationError";
  }
}

class UploadAbortedError extends MediaRequestError {
  constructor() {
    super("视频上传已取消，请重新选择文件上传。", 408, "VIDEO_UPLOAD_ABORTED");
    this.name = "UploadAbortedError";
  }
}

class MediaUploadValidationError extends MediaRequestError {
  constructor(message: string) {
    super(message, 400, "MEDIA_UPLOAD_INVALID");
    this.name = "MediaUploadValidationError";
  }
}

class MediaUploadAbortedError extends MediaRequestError {
  constructor() {
    super("文件上传已取消，请重新选择文件上传。", 408, "MEDIA_UPLOAD_ABORTED");
    this.name = "MediaUploadAbortedError";
  }
}

type VideoJobState = { active: number };
const globalVideoState = globalThis as typeof globalThis & { __fxVideoJobState?: VideoJobState };
const videoJobState = globalVideoState.__fxVideoJobState ??= { active: 0 };

function systemErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" && /^[A-Z0-9_-]{1,64}$/i.test(code) ? code : undefined;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new UploadAbortedError();
}

function acquireVideoJob(signal: AbortSignal) {
  throwIfAborted(signal);
  if (videoJobState.active >= MAX_CONCURRENT_VIDEO_JOBS) {
    throw new MediaRequestError("视频处理任务繁忙，请稍后重试。", 503, "VIDEO_PROCESSING_BUSY");
  }
  videoJobState.active += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    videoJobState.active = Math.max(0, videoJobState.active - 1);
  };
}

async function removeManagedFile(filePath: string, target: "temporary" | "output", requestId: string) {
  try {
    await rm(filePath, { force: true });
    return null;
  } catch (error) {
    const code = systemErrorCode(error);
    console.error("[admin-media] managed file cleanup failed", {
      requestId,
      event: "VIDEO_CLEANUP_FAILED",
      target,
      ...(code ? { systemCode: code } : {}),
    });
    return new MediaRequestError("视频处理服务暂不可用，请稍后重试。", 500, "VIDEO_CLEANUP_FAILED", code);
  }
}

function hasAllowedImageSignature(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (type === "image/gif") return bytes.length >= 6 && (new TextDecoder().decode(bytes.slice(0, 6)) === "GIF87a" || new TextDecoder().decode(bytes.slice(0, 6)) === "GIF89a");
  if (type === "image/webp") return bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}

function hasAllowedDocumentSignature(bytes: Uint8Array, type: string) {
  const isPdf = bytes.length >= 5 && new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  const isOle = bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1][index]);
  const isZip = bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && [0x03, 0x05, 0x07].includes(bytes[2]) && [0x04, 0x06, 0x08].includes(bytes[3]);
  const isSevenZip = bytes.length >= 6 && bytes.slice(0, 6).every((byte, index) => byte === [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c][index]);
  const isRar = bytes.length >= 7 && bytes.slice(0, 7).every((byte, index) => byte === [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00][index])
    || bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00][index]);
  if (type === "application/pdf") return isPdf;
  if (type === "application/msword" || type === "application/vnd.ms-powerpoint" || type === "application/vnd.ms-excel") return isOle;
  if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || type === "application/zip" || type === "application/x-zip-compressed") return isZip;
  if (type === "application/x-7z-compressed") return isSevenZip;
  if (type === "application/vnd.rar" || type === "application/x-rar-compressed") return isRar;
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

async function cleanupMediaUpload(filePath: string, requestId: string) {
  try {
    await rm(filePath, { force: true });
    return null;
  } catch (error) {
    const code = systemErrorCode(error);
    console.error("[admin-media] file upload cleanup failed", {
      requestId,
      event: "MEDIA_CLEANUP_FAILED",
      ...(code ? { systemCode: code } : {}),
    });
    return new MediaRequestError("文件上传服务暂不可用，请稍后重试。", 500, "MEDIA_CLEANUP_FAILED", code);
  }
}

async function handleMediaUpload(request: Request, requestId: string) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_DOCUMENT_SIZE + 64 * 1024) {
    throw new MediaUploadValidationError("文件大小必须在 20MB 以内");
  }
  if (!request.body) throw new MediaUploadValidationError("文件上传数据无效");

  const mediaRoot = path.join(process.cwd(), "public", "media");
  const uploadDirectory = path.join(mediaRoot, "uploads");
  const documentDirectory = path.join(mediaRoot, "documents");
  try {
    await Promise.all([
      mkdir(uploadDirectory, { recursive: true }),
      mkdir(documentDirectory, { recursive: true }),
    ]);
    await Promise.all([chmod(uploadDirectory, 0o755), chmod(documentDirectory, 0o755)]);
  } catch (error) {
    throw new MediaRequestError("文件上传服务暂不可用，请稍后重试。", 500, "MEDIA_UPLOAD_STORAGE_UNAVAILABLE", systemErrorCode(error));
  }

  let parser: ReturnType<typeof Busboy>;
  try {
    parser = Busboy({
      headers: Object.fromEntries(request.headers.entries()),
      limits: { files: 1, fields: 0, parts: 2, fileSize: MAX_DOCUMENT_SIZE },
    });
  } catch {
    throw new MediaUploadValidationError("文件上传数据无效");
  }

  let receivedFile = false;
  let temporaryPath: string | undefined;
  let writer: ReturnType<typeof createWriteStream> | undefined;
  let writerError: unknown;
  let validationError: MediaUploadValidationError | undefined;
  let upload: Promise<{ mimeType: string; size: number; outputPath: string; publicPath: string }> | undefined;

  const rejectUpload = (error: MediaUploadValidationError) => {
    validationError ??= error;
    if (!parser.destroyed) parser.destroy(validationError);
  };

  parser.once("filesLimit", () => rejectUpload(new MediaUploadValidationError("只能上传一个文件")));
  parser.once("fieldsLimit", () => rejectUpload(new MediaUploadValidationError("文件上传数据无效")));
  parser.once("partsLimit", () => rejectUpload(new MediaUploadValidationError("只能上传一个文件")));
  parser.on("file", (fieldName, stream, info) => {
    if (receivedFile || fieldName !== "file") {
      stream.resume();
      queueMicrotask(() => rejectUpload(new MediaUploadValidationError("只能上传一个文件")));
      return;
    }
    receivedFile = true;

    const imageExtension = allowedTypes.get(info.mimeType);
    const filenameExtension = path.extname(info.filename).toLowerCase();
    const detectedDocumentType = allowedDocumentTypes.has(info.mimeType)
      ? info.mimeType
      : (info.mimeType === "application/octet-stream" ? documentTypesByExtension.get(filenameExtension) : undefined);
    const documentExtension = detectedDocumentType ? allowedDocumentTypes.get(detectedDocumentType) : undefined;
    const extension = imageExtension ?? documentExtension;
    if (!extension) {
      stream.resume();
      queueMicrotask(() => rejectUpload(new MediaUploadValidationError("仅支持 JPG、PNG、WebP、GIF、PDF、Word、PPT、Excel 和 ZIP/7Z/RAR 压缩文件")));
      return;
    }

    const maximumSize = imageExtension ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
    const directoryName = imageExtension ? "uploads" : "documents";
    const directory = imageExtension ? uploadDirectory : documentDirectory;
    const filename = `${randomUUID()}${extension}`;
    const outputPath = path.join(directory, filename);
    temporaryPath = path.join(directory, `.${filename}.${requestId}.upload`);
    let size = 0;

    try {
      writer = createWriteStream(temporaryPath, { flags: "wx", mode: 0o600 });
      const currentWriter = writer;
      const currentTemporaryPath = temporaryPath;
      currentWriter.once("error", (error) => { writerError = error; });
      stream.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > maximumSize && !validationError) {
          rejectUpload(new MediaUploadValidationError(imageExtension ? "图片大小必须在 5MB 以内" : "文件大小必须在 20MB 以内"));
        }
      });
      stream.once("limit", () => rejectUpload(new MediaUploadValidationError("文件大小必须在 20MB 以内")));
      upload = pipeline(stream, currentWriter, { signal: request.signal })
        .then(() => ({
          mimeType: imageExtension ? info.mimeType : detectedDocumentType!,
          size,
          outputPath,
          publicPath: `/media/${directoryName}/${filename}`,
        }))
        .catch((error: unknown) => {
          if (validationError) throw validationError;
          if (request.signal.aborted || isAbortError(error)) throw new MediaUploadAbortedError();
          if (writerError) {
            throw new MediaRequestError("文件保存失败，请稍后重试。", 500, "MEDIA_WRITE_FAILED", systemErrorCode(writerError));
          }
          throw error;
        });
      void upload.catch(() => undefined);
      temporaryPath = currentTemporaryPath;
    } catch (error) {
      writerError = error;
      stream.resume();
      upload = Promise.reject(new MediaRequestError("文件保存失败，请稍后重试。", 500, "MEDIA_WRITE_FAILED", systemErrorCode(error)));
      void upload.catch(() => undefined);
    }
  });

  try {
    await pipeline(
      Readable.fromWeb(request.body as unknown as import("node:stream/web").ReadableStream),
      parser,
      { signal: request.signal },
    );
    if (validationError) throw validationError;
    if (!upload || !temporaryPath) throw new MediaUploadValidationError("请选择需要上传的文件");

    const uploaded = await upload;
    if (uploaded.size <= 0) throw new MediaUploadValidationError("上传文件不能为空");
    let signature: Uint8Array;
    try {
      signature = await readPrefix(temporaryPath);
    } catch (error) {
      throw new MediaRequestError("文件校验失败，请稍后重试。", 500, "MEDIA_READ_FAILED", systemErrorCode(error));
    }
    const signatureAllowed = allowedTypes.has(uploaded.mimeType)
      ? hasAllowedImageSignature(signature, uploaded.mimeType)
      : hasAllowedDocumentSignature(signature, uploaded.mimeType);
    if (!signatureAllowed) throw new MediaUploadValidationError("文件格式与扩展名不匹配");

    try {
      await chmod(temporaryPath, 0o644);
      await rename(temporaryPath, uploaded.outputPath);
    } catch (error) {
      throw new MediaRequestError("文件保存失败，请稍后重试。", 500, "MEDIA_WRITE_FAILED", systemErrorCode(error));
    }
    temporaryPath = undefined;
    return NextResponse.json({ path: uploaded.publicPath });
  } catch (error) {
    writer?.destroy();
    if (upload) await Promise.allSettled([upload]);
    const cleanupError = temporaryPath ? await cleanupMediaUpload(temporaryPath, requestId) : null;
    if (cleanupError) throw cleanupError;
    if (error instanceof MediaRequestError) throw error;
    if (request.signal.aborted || isAbortError(error)) throw new MediaUploadAbortedError();
    if (writerError) throw new MediaRequestError("文件保存失败，请稍后重试。", 500, "MEDIA_WRITE_FAILED", systemErrorCode(writerError));
    throw new MediaUploadValidationError("文件上传数据无效");
  }
}

async function receiveVideoUpload(request: Request, requestId: string) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_VIDEO_SIZE + 64 * 1024) throw new UploadValidationError("视频文件大小必须在 2GB 以内");
  if (!request.body) throw new UploadValidationError("视频上传数据无效");
  throwIfAborted(request.signal);

  const temporaryDirectory = path.join(tmpdir(), "fx-web-video-upload");
  let temporaryPath: string | undefined;
  let writer: ReturnType<typeof createWriteStream> | undefined;
  let upload: Promise<{ path: string; mimeType: string }> | undefined;
  let validationError: UploadValidationError | undefined;
  let writerError: unknown;
  let receivedFile = false;
  try {
    await mkdir(temporaryDirectory, { recursive: true });
  } catch (error) {
    throw new MediaRequestError("视频上传服务暂不可用，请稍后重试。", 500, "VIDEO_UPLOAD_STORAGE_UNAVAILABLE", systemErrorCode(error));
  }
  try {
    let parser: ReturnType<typeof Busboy>;
    try {
      parser = Busboy({
        headers: Object.fromEntries(request.headers.entries()),
        limits: { files: 1, fields: 0, parts: 2, fileSize: MAX_VIDEO_SIZE },
      });
    } catch {
      throw new UploadValidationError("视频上传数据无效");
    }

    parser.once("filesLimit", () => { validationError ??= new UploadValidationError("只能上传一个视频文件"); });
    parser.once("fieldsLimit", () => { validationError ??= new UploadValidationError("视频上传数据无效"); });
    parser.once("partsLimit", () => { validationError ??= new UploadValidationError("只能上传一个视频文件"); });
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

      temporaryPath = path.join(temporaryDirectory, `${randomUUID()}${extension}`);
      try {
        writer = createWriteStream(temporaryPath, { flags: "wx" });
        const currentPath = temporaryPath;
        const currentWriter = writer;
        let exceededSizeLimit = false;
        stream.once("limit", () => { exceededSizeLimit = true; });
        currentWriter.once("error", (error) => { writerError = error; });
        upload = pipeline(stream, currentWriter, { signal: request.signal }).then(() => {
          if (exceededSizeLimit) throw new UploadValidationError("视频文件大小必须在 2GB 以内");
          return { path: currentPath, mimeType: info.mimeType };
        }).catch((error: unknown) => {
          if (request.signal.aborted || isAbortError(error)) throw new UploadAbortedError();
          if (exceededSizeLimit) throw new UploadValidationError("视频文件大小必须在 2GB 以内");
          if (writerError) {
            throw new MediaRequestError("视频上传服务暂不可用，请稍后重试。", 500, "VIDEO_UPLOAD_WRITE_FAILED", systemErrorCode(writerError));
          }
          throw error;
        });
        void upload.catch(() => undefined);
      } catch (error) {
        writerError = error;
        stream.resume();
        upload = Promise.reject(new MediaRequestError("视频上传服务暂不可用，请稍后重试。", 500, "VIDEO_UPLOAD_WRITE_FAILED", systemErrorCode(error)));
        void upload.catch(() => undefined);
      }
    });

    await pipeline(
      Readable.fromWeb(request.body as unknown as import("node:stream/web").ReadableStream),
      parser,
      { signal: request.signal },
    );
    if (validationError) throw validationError;
    if (!upload) throw new UploadValidationError("请选择需要上传的视频文件");
    return await upload;
  } catch (error) {
    writer?.destroy();
    if (upload) await Promise.allSettled([upload]);
    const cleanupError = temporaryPath ? await removeManagedFile(temporaryPath, "temporary", requestId) : null;
    if (cleanupError) throw cleanupError;
    if (error instanceof MediaRequestError) throw error;
    if (request.signal.aborted || isAbortError(error)) throw new UploadAbortedError();
    if (writerError) {
      throw new MediaRequestError("视频上传服务暂不可用，请稍后重试。", 500, "VIDEO_UPLOAD_WRITE_FAILED", systemErrorCode(writerError));
    }
    throw new UploadValidationError("视频上传数据无效");
  }
}

function isOperationalFfmpegFailure(stderr: string) {
  return /no space left on device|permission denied|read-only file system|input\/output error|no such file or directory|cannot allocate memory|resource temporarily unavailable/i.test(stderr);
}

async function transcodeVideo(inputPath: string, outputPath: string, signal: AbortSignal) {
  throwIfAborted(signal);
  await new Promise<void>((resolve, reject) => {
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(/* turbopackIgnore: true */ ffmpegPath, [
        "-hide_banner", "-loglevel", "error", "-y", "-i", inputPath,
        "-map", "0:v:0", "-map", "0:a?",
        "-vf", "scale=w='min(1920,iw)':h=-2:force_original_aspect_ratio=decrease:force_divisible_by=2",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
        outputPath,
      ], { stdio: ["ignore", "ignore", "pipe"] });
    } catch (error) {
      reject(new MediaRequestError("视频转码服务暂不可用，请稍后重试。", 503, "VIDEO_TRANSCODER_UNAVAILABLE", systemErrorCode(error)));
      return;
    }

    let stderr = "";
    let terminationError: MediaRequestError | undefined;
    let settled = false;
    let forceKillTimer: ReturnType<typeof setTimeout> | undefined;
    const timeout = setTimeout(() => {
      terminate(new MediaRequestError("视频处理超时，请压缩视频后重试。", 504, "VIDEO_TRANSCODE_TIMEOUT"));
    }, VIDEO_TRANSCODE_TIMEOUT_MS);
    timeout.unref();

    const cleanup = () => {
      clearTimeout(timeout);
      if (forceKillTimer) clearTimeout(forceKillTimer);
      signal.removeEventListener("abort", onAbort);
    };
    const settle = (error?: MediaRequestError) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(error);
      else resolve();
    };
    function terminate(error: MediaRequestError) {
      if (terminationError || settled) return;
      terminationError = error;
      if (child.exitCode !== null || child.signalCode !== null) return;
      child.kill("SIGTERM");
      forceKillTimer = setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
      }, VIDEO_PROCESS_KILL_GRACE_MS);
      forceKillTimer.unref();
    }
    const onAbort = () => terminate(new UploadAbortedError());

    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (chunk: string) => {
      if (stderr.length < 16 * 1024) stderr += chunk.slice(0, 16 * 1024 - stderr.length);
    });
    child.once("error", (error) => {
      settle(new MediaRequestError("视频转码服务暂不可用，请稍后重试。", 503, "VIDEO_TRANSCODER_UNAVAILABLE", systemErrorCode(error)));
    });
    child.once("close", (code, signalCode) => {
      if (terminationError) {
        settle(terminationError);
        return;
      }
      if (signalCode) {
        settle(new MediaRequestError("视频处理服务暂不可用，请稍后重试。", 500, "VIDEO_TRANSCODE_TERMINATED"));
        return;
      }
      if (code === 0) {
        settle();
        return;
      }
      if (isOperationalFfmpegFailure(stderr)) {
        settle(new MediaRequestError("视频处理服务暂不可用，请稍后重试。", 500, "VIDEO_TRANSCODE_SYSTEM_FAILED"));
        return;
      }
      settle(new MediaRequestError("视频转码失败，请确认文件可以正常播放。", 422, "VIDEO_TRANSCODE_REJECTED"));
    });
    signal.addEventListener("abort", onAbort, { once: true });
    if (signal.aborted) onAbort();
  });
}

async function handleVideoUpload(request: Request, requestId: string) {
  const releaseVideoJob = acquireVideoJob(request.signal);
  const outputDirectory = path.join(process.cwd(), "public", "media", "videos");
  const outputFilename = `${randomUUID()}.mp4`;
  const outputPath = path.join(outputDirectory, outputFilename);
  let temporaryPath: string | undefined;
  let keepOutput = false;
  try {
    const uploaded = await receiveVideoUpload(request, requestId);
    temporaryPath = uploaded.path;
    throwIfAborted(request.signal);
    const signature = await readPrefix(uploaded.path);
    if (!hasAllowedVideoSignature(signature, uploaded.mimeType)) throw new UploadValidationError("视频文件格式无效");
    await mkdir(outputDirectory, { recursive: true });
    await chmod(outputDirectory, 0o755);
    await transcodeVideo(uploaded.path, outputPath, request.signal);
    await chmod(outputPath, 0o644);
    throwIfAborted(request.signal);
    keepOutput = true;
    return NextResponse.json({ path: `/media/videos/${outputFilename}` });
  } finally {
    const cleanupErrors: MediaRequestError[] = [];
    if (temporaryPath) {
      const error = await removeManagedFile(temporaryPath, "temporary", requestId);
      if (error) cleanupErrors.push(error);
    }
    if (request.signal.aborted) keepOutput = false;
    if (cleanupErrors.length > 0) keepOutput = false;
    if (!keepOutput) {
      const error = await removeManagedFile(outputPath, "output", requestId);
      if (error) cleanupErrors.push(error);
    }
    releaseVideoJob();
    if (cleanupErrors[0]) throw cleanupErrors[0];
  }
}

function logMediaFailure(error: MediaRequestError, requestId: string, kind: "video" | "file") {
  const details = {
    requestId,
    event: error.logCode,
    status: error.status,
    ...(error.systemCode ? { systemCode: error.systemCode } : {}),
  };
  if (error.status >= 500) console.error(`[admin-media] ${kind} request failed`, details);
  else console.warn(`[admin-media] ${kind} request rejected`, details);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "请求格式必须为 multipart/form-data" }, { status: 400 });
  }

  const requestId = randomUUID();
  if (isVideoUpload(request)) {
    try {
      return await handleVideoUpload(request, requestId);
    } catch (error) {
      const mediaError = error instanceof MediaRequestError
        ? error
        : new MediaRequestError("视频上传失败，请稍后重试。", 500, "VIDEO_UPLOAD_INTERNAL", systemErrorCode(error));
      logMediaFailure(mediaError, requestId, "video");
      const headers = mediaError.logCode === "VIDEO_PROCESSING_BUSY" ? { "Retry-After": "30" } : undefined;
      return NextResponse.json({ error: mediaError.message, requestId }, { status: mediaError.status, headers });
    }
  }

  try {
    return await handleMediaUpload(request, requestId);
  } catch (error) {
    const mediaError = error instanceof MediaRequestError
      ? error
      : new MediaRequestError("文件上传失败，请稍后重试。", 500, "MEDIA_UPLOAD_INTERNAL", systemErrorCode(error));
    logMediaFailure(mediaError, requestId, "file");
    return NextResponse.json({ error: mediaError.message, requestId }, { status: mediaError.status });
  }
}
