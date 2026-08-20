import assert from "node:assert/strict";
import test from "node:test";
import { filterArticlesByCategory, getArticleCategories, getKnowledgeMeta, paginateKnowledgeEntries, toCurrentKnowledgeEntry, type KnowledgeEntry } from "../lib/knowledge-content.ts";

test("builds an article with only current article fields", () => {
  const article = {
    slug: "policy-entry",
    type: "article",
    category: "碳政策",
    title: "政策文章",
    summary: "摘要",
    meta: "公众号文章",
    sections: [],
    sourceHref: "https://mp.weixin.qq.com/s/example",
    videoHref: "/media/videos/course.mp4",
    externalHref: "https://www.bilibili.com/video/example",
    externalLabel: "观看课程",
  } as unknown as KnowledgeEntry;

  assert.deepEqual(toCurrentKnowledgeEntry(article), {
    slug: "policy-entry",
    type: "article",
    category: "碳政策",
    title: "政策文章",
    summary: "摘要",
    meta: "公众号文章",
    sections: [],
    sourceHref: "https://mp.weixin.qq.com/s/example",
  });
});

test("builds a course with only current course fields", () => {
  const course = {
    slug: "course-entry",
    type: "course",
    category: "视频课程",
    title: "课程",
    summary: "摘要",
    meta: "入门课程",
    sections: [],
    sourceName: "政策来源",
    sourceHref: "https://mp.weixin.qq.com/s/source",
    videoHref: "/media/videos/course.mp4",
    externalHref: "https://www.bilibili.com/video/example",
    externalLabel: "前往观看",
  } as unknown as KnowledgeEntry;

  assert.deepEqual(toCurrentKnowledgeEntry(course), {
    slug: "course-entry",
    type: "course",
    category: "视频课程",
    title: "课程",
    summary: "摘要",
    meta: "入门课程",
    sections: [],
    videoHref: "/media/videos/course.mp4",
    externalHref: "https://www.bilibili.com/video/example",
    externalLabel: "前往观看",
  });
});

test("keeps an explicit empty course video binding", () => {
  const course: KnowledgeEntry = {
    slug: "course-without-video",
    type: "course",
    category: "视频课程",
    title: "暂无视频的课程",
    summary: "摘要",
    meta: "课程",
    sections: [],
    videoHref: "",
  };

  assert.equal(toCurrentKnowledgeEntry(course).videoHref, "");
});

test("keeps course cover and external access fields", () => {
  const course: KnowledgeEntry = {
    slug: "course-with-external-access",
    type: "course",
    category: "视频课程",
    title: "外链课程",
    summary: "摘要",
    meta: "课程",
    coverImage: "/materials/course-cover.png",
    externalHref: "https://www.bilibili.com/video/example",
    externalLabel: "前往观看",
    sections: [],
  };

  assert.deepEqual(toCurrentKnowledgeEntry(course), course);
});

test("builds article categories in editorial order without duplicates", () => {
  const entries = [
    { slug: "policy-one", type: "article", category: "碳政策", title: "政策一", summary: "摘要", meta: "文章", sections: [] },
    { slug: "accounting", type: "article", category: "碳核算", title: "核算", summary: "摘要", meta: "文章", sections: [] },
    { slug: "policy-two", type: "article", category: " 碳政策 ", title: "政策二", summary: "摘要", meta: "文章", sections: [] },
    { slug: "course", type: "course", category: "碳政策", title: "课程", summary: "摘要", meta: "课程", sections: [] },
  ] satisfies KnowledgeEntry[];

  assert.deepEqual(getArticleCategories(entries), ["碳政策", "碳核算"]);
});

test("filters only articles in the selected category", () => {
  const entries = [
    { slug: "policy", type: "article", category: "碳政策", title: "政策", summary: "摘要", meta: "文章", sections: [] },
    { slug: "accounting", type: "article", category: "碳核算", title: "核算", summary: "摘要", meta: "文章", sections: [] },
    { slug: "course", type: "course", category: "碳政策", title: "课程", summary: "摘要", meta: "课程", sections: [] },
  ] satisfies KnowledgeEntry[];

  assert.deepEqual(filterArticlesByCategory(entries).map((entry) => entry.slug), ["policy", "accounting"]);
  assert.deepEqual(filterArticlesByCategory(entries, "碳政策").map((entry) => entry.slug), ["policy"]);
  assert.deepEqual(filterArticlesByCategory(entries, "不存在"), []);
});

test("sorts articles by publish time descending and keeps undated articles stable", () => {
  const entries = [
    { slug: "undated-one", type: "article", category: "碳政策", title: "未标日期文章一", summary: "摘要", meta: "文章", sections: [] },
    { slug: "older", type: "article", category: "碳政策", title: "较早文章", summary: "摘要", meta: "文章", publishedAt: "2026-08-10T08:00:00.000Z", sections: [] },
    { slug: "undated-two", type: "article", category: "碳政策", title: "未标日期文章二", summary: "摘要", meta: "文章", sections: [] },
    { slug: "newer", type: "article", category: "碳政策", title: "最新文章", summary: "摘要", meta: "文章", publishedAt: "2026-08-17T08:00:00.000Z", sections: [] },
    { slug: "course", type: "course", category: "碳政策", title: "课程", summary: "摘要", meta: "课程", publishedAt: "2026-08-18T08:00:00.000Z", sections: [] },
  ] satisfies KnowledgeEntry[];

  assert.deepEqual(filterArticlesByCategory(entries).map((entry) => entry.slug), ["newer", "older", "undated-one", "undated-two"]);
});

test("paginates entries and clamps requested pages to the available range", () => {
  const entries = Array.from({ length: 23 }, (_, index) => ({
    slug: `article-${index + 1}`,
    type: "article" as const,
    category: "碳政策",
    title: `文章 ${index + 1}`,
    summary: "摘要",
    meta: "文章",
    sections: [],
  }));

  const secondPage = paginateKnowledgeEntries(entries, 2, 10);
  assert.deepEqual(secondPage.items.map((entry) => entry.slug), entries.slice(10, 20).map((entry) => entry.slug));
  assert.deepEqual({ currentPage: secondPage.currentPage, totalPages: secondPage.totalPages, totalItems: secondPage.totalItems }, { currentPage: 2, totalPages: 3, totalItems: 23 });
  assert.equal(paginateKnowledgeEntries(entries, 99, 10).currentPage, 3);
  assert.equal(paginateKnowledgeEntries(entries, 0, 10).currentPage, 1);
});

test("shows category once when metadata already contains it", () => {
  const article: KnowledgeEntry = {
    slug: "policy",
    type: "article",
    category: "碳政策",
    title: "政策",
    summary: "摘要",
    meta: "公众号文章 · 碳政策",
    sections: [],
  };

  assert.equal(getKnowledgeMeta(article), "碳政策 · 公众号文章");
});
