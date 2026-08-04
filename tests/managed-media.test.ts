import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { access, mkdir, mkdtemp, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { cleanupManagedMedia, collectManagedMediaPaths } from "../lib/managed-media.ts";

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

test("collects only uploader-managed media paths", () => {
  const id = randomUUID();
  const documentId = randomUUID();
  const collected = collectManagedMediaPaths({
    image: `/media/uploads/${id}.png`,
    video: `/media/videos/${id}.mp4`,
    documentWithFragment: `/media/documents/${documentId}.pdf#page=2`,
    staticImage: "/media/product-platform-hero.webp",
    traversal: "/media/uploads/../secret.png",
  });
  assert.deepEqual(
    [...collected].sort(),
    [`/media/documents/${documentId}.pdf`, `/media/uploads/${id}.png`, `/media/videos/${id}.mp4`].sort(),
  );
});

test("removes unbound media and sweeps only expired unreferenced uploads", async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), "fx-managed-media-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const publicRoot = path.join(root, "public");
  const uploads = path.join(publicRoot, "media", "uploads");
  await mkdir(uploads, { recursive: true });

  const removedId = randomUUID();
  const retainedId = randomUUID();
  const expiredId = randomUUID();
  const freshId = randomUUID();
  const removedPath = path.join(uploads, `${removedId}.png`);
  const retainedPath = path.join(uploads, `${retainedId}.png`);
  const expiredPath = path.join(uploads, `${expiredId}.png`);
  const freshPath = path.join(uploads, `${freshId}.png`);
  const unmanagedPath = path.join(uploads, "manual.png");
  await Promise.all([removedPath, retainedPath, expiredPath, freshPath, unmanagedPath].map((file) => writeFile(file, "test")));

  const now = Date.now();
  const expired = new Date(now - 48 * 60 * 60 * 1000);
  await utimes(expiredPath, expired, expired);

  const result = await cleanupManagedMedia(
    { image: `/media/uploads/${removedId}.png`, retained: `/media/uploads/${retainedId}.png` },
    { retained: `/media/uploads/${retainedId}.png` },
    { publicRoot, now, gracePeriodMs: 24 * 60 * 60 * 1000 },
  );

  assert.equal(await exists(removedPath), false);
  assert.equal(await exists(retainedPath), true);
  assert.equal(await exists(expiredPath), false);
  assert.equal(await exists(freshPath), true);
  assert.equal(await exists(unmanagedPath), true);
  assert.equal(result.failed, 0);
  assert.equal(result.deleted, 2);
});
