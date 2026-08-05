import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import {
  getManagedMediaPath,
  getManagedVideoStreamUrl,
  isAllowedContentHref,
  isHttpsContentUrl,
  isLocalContentPath,
  isManagedDocumentPath,
  isOptionalAllowedContentHref,
  isRuntimeManagedImage,
} from "../lib/media-url.ts";

test("accepts complete local media paths and HTTPS links", () => {
  assert.equal(isLocalContentPath("/media/videos/550e8400-e29b-41d4-a716-446655440000.mp4"), true);
  assert.equal(isAllowedContentHref("/materials/20260803/资料/课程视频.mp4"), true);
  assert.equal(isAllowedContentHref("https://app.powerbi.com/view?r=public-report"), true);
  assert.equal(isOptionalAllowedContentHref(""), true);
  assert.equal(isHttpsContentUrl("http://example.com/video.mp4"), false);
  assert.equal(isAllowedContentHref("//evil.example/video.mp4"), false);
  assert.equal(isAllowedContentHref("/media/videos/path with spaces.mp4"), false);
  assert.equal(isAllowedContentHref("https://user:password@example.com/video.mp4"), false);
});

test("normalizes managed media references without query strings or fragments", () => {
  const id = randomUUID();
  assert.equal(getManagedMediaPath(`/media/documents/${id}.pdf#page=2`), `/media/documents/${id}.pdf`);
  assert.equal(getManagedMediaPath(`/media/videos/${id}.mp4?download=1`), `/media/videos/${id}.mp4`);
});

test("recognizes only uploader-managed image paths", () => {
  const id = randomUUID();
  assert.equal(isRuntimeManagedImage(`/media/uploads/${id}.webp?v=2`), true);
  assert.equal(isRuntimeManagedImage(`/media/documents/${id}.pdf`), false);
  assert.equal(isRuntimeManagedImage("/media/uploads/../secret.png"), false);
  assert.equal(isRuntimeManagedImage(`https://example.com/media/uploads/${id}.png`), false);
});

test("recognizes only uploader-managed document paths as direct downloads", () => {
  const id = randomUUID();
  assert.equal(isManagedDocumentPath(`/media/documents/${id}.pdf`), true);
  assert.equal(isManagedDocumentPath(`/media/uploads/${id}.pdf`), false);
  assert.equal(isManagedDocumentPath("/materials/handbook.pdf"), false);
  assert.equal(isManagedDocumentPath(`https://example.com/media/documents/${id}.pdf`), false);
});

test("uses the streaming endpoint only for uploader-managed videos", () => {
  const id = randomUUID();
  assert.equal(getManagedVideoStreamUrl(`/media/videos/${id}.mp4`), `/api/media/video/${id}.mp4`);
  assert.equal(getManagedVideoStreamUrl("/materials/course.mp4"), null);
  assert.equal(getManagedVideoStreamUrl(`https://example.com/media/videos/${id}.mp4`), null);
});
