import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { getManagedMediaPath } from "@/lib/media-url";
import { parseVideoByteRange } from "@/lib/video-stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function notFound() {
  return new Response(null, { status: 404 });
}

async function streamVideo(request: Request, filename: string, headOnly = false) {
  const managedPath = getManagedMediaPath(`/media/videos/${filename}`);
  if (!managedPath || path.basename(managedPath) !== filename) return notFound();

  const filePath = path.join(process.cwd(), "public", ...managedPath.slice(1).split("/"));
  let metadata;
  try {
    metadata = await stat(filePath);
  } catch {
    return notFound();
  }
  if (!metadata.isFile()) return notFound();

  const range = parseVideoByteRange(request.headers.get("range"), metadata.size);
  const baseHeaders = {
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": "video/mp4",
    "X-Content-Type-Options": "nosniff",
  };
  if (range === false) {
    return new Response(null, {
      status: 416,
      headers: { ...baseHeaders, "Content-Range": `bytes */${metadata.size}` },
    });
  }

  const start = range?.start ?? 0;
  const end = range?.end ?? metadata.size - 1;
  const length = end - start + 1;
  const headers = {
    ...baseHeaders,
    "Content-Length": String(length),
    ...(range ? { "Content-Range": `bytes ${start}-${end}/${metadata.size}` } : {}),
  };
  if (headOnly) return new Response(null, { status: range ? 206 : 200, headers });

  const stream = createReadStream(filePath, { start, end });
  request.signal.addEventListener("abort", () => stream.destroy(), { once: true });
  return new Response(Readable.toWeb(stream) as ReadableStream, { status: range ? 206 : 200, headers });
}

type VideoRouteContext = { params: Promise<{ filename: string }> };

export async function GET(request: Request, context: VideoRouteContext) {
  const { filename } = await context.params;
  return streamVideo(request, filename);
}

export async function HEAD(request: Request, context: VideoRouteContext) {
  const { filename } = await context.params;
  return streamVideo(request, filename, true);
}
