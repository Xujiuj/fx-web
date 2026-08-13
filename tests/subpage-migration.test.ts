import assert from "node:assert/strict";
import test from "node:test";
import { migrateStoredSubpage } from "../lib/subpage-migration.ts";

type TestSection = {
  id: string;
  title: string;
  items: Array<{ title: string; description?: string; details?: Record<string, string> }>;
};

type TestPage = {
  slug: string;
  schemaVersion?: number;
  sections: TestSection[];
  media?: Record<string, string>;
  product?: { videoUrl?: string; enterpriseUrl?: string };
};

function section(id: string, items: TestSection["items"] = []): TestSection {
  return { id, title: id, items };
}

test("v2 keeps deleted legacy modules while adding only v3 modules", () => {
  const page: TestPage = { slug: "customer-cases", schemaVersion: 2, sections: [] };
  const fallback: TestPage = {
    slug: "customer-cases",
    schemaVersion: 3,
    sections: [
      section("case-categories"),
      section("case-introduction"),
      section("case-structure"),
      section("case-cta"),
      section("unrelated-default"),
    ],
  };

  const migrated = migrateStoredSubpage(page, fallback, 3);
  assert.equal(migrated.schemaVersion, 3);
  assert.deepEqual(migrated.sections.map((item) => item.id), ["case-introduction", "case-structure", "case-cta"]);
});

test("v3 adds only v4 knowledge modules without restoring deleted v3 modules", () => {
  const page: TestPage = {
    slug: "knowledge-center",
    schemaVersion: 3,
    sections: [section("downloads")],
  };
  const fallback: TestPage = {
    slug: "knowledge-center",
    schemaVersion: 4,
    sections: [
      section("video-courses"),
      section("downloads"),
      section("knowledge-cta"),
      section("unrelated-default"),
    ],
  };

  const migrated = migrateStoredSubpage(page, fallback, 4);
  assert.equal(migrated.schemaVersion, 4);
  assert.deepEqual(migrated.sections.map((item) => item.id), ["downloads", "video-courses"]);
});

test("v4 adds the configured online classroom without restoring older modules", () => {
  const page: TestPage = { slug: "knowledge-center", schemaVersion: 4, sections: [section("downloads")] };
  const fallback: TestPage = { slug: "knowledge-center", schemaVersion: 5, sections: [section("video-courses"), section("online-classroom", [{ title: "进入在线课堂" }])] };

  const migrated = migrateStoredSubpage(page, fallback, 5);

  assert.deepEqual(migrated.sections.map((section) => section.id), ["downloads", "online-classroom"]);
});

test("v2 upgrading directly to v4 receives cumulative section additions", () => {
  const page: TestPage = { slug: "knowledge-center", schemaVersion: 2, sections: [] };
  const fallback: TestPage = {
    slug: "knowledge-center",
    schemaVersion: 4,
    sections: [section("video-courses"), section("downloads"), section("knowledge-cta")],
  };

  const migrated = migrateStoredSubpage(page, fallback, 4);
  assert.equal(migrated.schemaVersion, 4);
  assert.deepEqual(migrated.sections.map((item) => item.id), ["video-courses", "knowledge-cta"]);
});

test("v2 keeps explicitly removed media and product values", () => {
  const page: TestPage = {
    slug: "carbon-management-platform",
    schemaVersion: 2,
    sections: [],
    media: {},
    product: {},
  };
  const fallback: TestPage = {
    slug: "carbon-management-platform",
    schemaVersion: 3,
    sections: [],
    media: { diagram: "/media/default.png" },
    product: { videoUrl: "/media/videos/default.mp4", enterpriseUrl: "/sample/" },
  };

  const migrated = migrateStoredSubpage(page, fallback, 3);
  assert.deepEqual(migrated.media, {});
  assert.deepEqual(migrated.product, {});
});

test("v2 receives product defaults only when the field did not exist", () => {
  const page: TestPage = {
    slug: "carbon-management-platform",
    schemaVersion: 2,
    sections: [],
  };
  const fallback: TestPage = {
    slug: "carbon-management-platform",
    schemaVersion: 3,
    sections: [],
    product: { videoUrl: "/media/videos/default.mp4", enterpriseUrl: "/sample/" },
  };

  const migrated = migrateStoredSubpage(page, fallback, 3);
  assert.deepEqual(migrated.product, fallback.product);
  assert.notEqual(migrated.product, fallback.product);
});

test("fallback details match by title and never by array position", () => {
  const page: TestPage = {
    slug: "customer-cases",
    schemaVersion: 2,
    sections: [section("case-categories", [{ title: "已重命名" }, { title: "案例 B" }])],
  };
  const fallback: TestPage = {
    slug: "customer-cases",
    schemaVersion: 3,
    sections: [section("case-categories", [
      { title: "案例 A", details: { marker: "A" } },
      { title: "案例 B", details: { marker: "B" } },
    ])],
  };

  const migrated = migrateStoredSubpage(page, fallback, 3);
  assert.equal(migrated.sections[0].items[0].details, undefined);
  assert.deepEqual(migrated.sections[0].items[1].details, { marker: "B" });
});

test("v3 preserves explicit empty sections exactly", () => {
  const page: TestPage = { slug: "customer-cases", schemaVersion: 3, sections: [], media: {}, product: {} };
  const fallback: TestPage = { slug: "customer-cases", schemaVersion: 3, sections: [section("case-cta")] };

  assert.deepEqual(migrateStoredSubpage(page, fallback, 3), page);
});

test("legacy content still receives missing defaults without positional item matching", () => {
  const page: TestPage = {
    slug: "legacy-page",
    sections: [section("legacy", [{ title: "renamed" }])],
    media: {},
    product: {},
  };
  const fallback: TestPage = {
    slug: "legacy-page",
    schemaVersion: 3,
    sections: [section("legacy", [{ title: "original", description: "must not leak" }]), section("new-default")],
    media: { diagram: "/media/default.png" },
    product: { videoUrl: "/media/videos/default.mp4" },
  };

  const migrated = migrateStoredSubpage(page, fallback, 3);
  assert.equal(migrated.schemaVersion, 3);
  assert.equal(migrated.sections[0].items[0].description, undefined);
  assert.deepEqual(migrated.sections.map((item) => item.id), ["legacy", "new-default"]);
  assert.deepEqual(migrated.media, fallback.media);
  assert.deepEqual(migrated.product, fallback.product);
});
