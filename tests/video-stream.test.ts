import assert from "node:assert/strict";
import test from "node:test";
import { parseVideoByteRange } from "../lib/video-stream.ts";

test("returns a full response when no byte range is requested", () => {
  assert.equal(parseVideoByteRange(null, 1000), null);
});

test("parses normal, open-ended, and suffix video ranges", () => {
  assert.deepEqual(parseVideoByteRange("bytes=100-299", 1000), { start: 100, end: 299 });
  assert.deepEqual(parseVideoByteRange("bytes=900-", 1000), { start: 900, end: 999 });
  assert.deepEqual(parseVideoByteRange("bytes=-200", 1000), { start: 800, end: 999 });
  assert.deepEqual(parseVideoByteRange("bytes=900-1200", 1000), { start: 900, end: 999 });
});

test("rejects unsatisfiable or multi-part video ranges", () => {
  assert.equal(parseVideoByteRange("bytes=1000-", 1000), false);
  assert.equal(parseVideoByteRange("bytes=500-200", 1000), false);
  assert.equal(parseVideoByteRange("bytes=0-1,4-5", 1000), false);
});
