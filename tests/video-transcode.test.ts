import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);

test("video transcode filter normalizes odd source dimensions for yuv420p", async (context) => {
  const routeSource = await readFile(
    new URL("../app/api/admin/media/route.ts", import.meta.url),
    "utf8",
  );
  const scaleFilter = routeSource.match(/"-vf",\s*"([^"]+)"/)?.[1];
  assert.ok(scaleFilter, "media route must configure an ffmpeg video filter");

  const fixtureDirectory = await mkdtemp(path.join(tmpdir(), "fx-video-transcode-"));
  context.after(() => rm(fixtureDirectory, { recursive: true, force: true }));
  const outputPath = path.join(fixtureDirectory, "odd-dimensions.mp4");

  await execFileAsync(process.env.FFMPEG_PATH?.trim() || "/usr/bin/ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", "testsrc=size=641x359:rate=1",
    "-frames:v", "1", "-vf", scaleFilter,
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    outputPath,
  ]);

  const { stdout } = await execFileAsync("/usr/bin/ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,pix_fmt",
    "-of", "json", outputPath,
  ]);
  const stream = (JSON.parse(stdout) as {
    streams?: Array<{ width?: number; height?: number; pix_fmt?: string }>;
  }).streams?.[0];

  assert.ok(stream, "transcoded fixture must contain a video stream");
  assert.equal(stream.width, 640);
  assert.equal((stream.height ?? 1) % 2, 0);
  assert.equal(stream.pix_fmt, "yuv420p");
});
