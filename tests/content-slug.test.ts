import assert from "node:assert/strict";
import test from "node:test";
import { contentSlugPattern, isContentSlug } from "../lib/content-slug.ts";

test("uses one canonical slug contract for admin validation and stored content", () => {
  for (const slug of ["course", "enterprise-carbon-accounting-intro", "course-2026"]) {
    assert.equal(contentSlugPattern.test(slug), true);
    assert.equal(isContentSlug(slug), true);
  }

  for (const slug of ["-course", "course-", "course--intro", "Course", "course intro", ""]) {
    assert.equal(contentSlugPattern.test(slug), false);
    assert.equal(isContentSlug(slug), false);
  }
});
