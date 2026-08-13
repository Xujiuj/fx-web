import assert from "node:assert/strict";
import test from "node:test";
import { normalizeKnowledgeEntry, type KnowledgeEntry } from "../lib/knowledge-content.ts";

test("removes course-only fields from articles", () => {
  const article = {
    slug: "policy-entry",
    type: "article",
    category: "碳政策",
    title: "政策文章",
    summary: "摘要",
    meta: "公众号文章",
    sections: [],
    sourceHref: "https://mp.weixin.qq.com/s/example",
    videoHref: "/media/videos/legacy.mp4",
    externalHref: "https://www.bilibili.com/video/example",
    externalLabel: "观看课程",
  } as unknown as KnowledgeEntry;

  assert.deepEqual(normalizeKnowledgeEntry(article), {
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

test("removes article-only fields from courses", () => {
  const course = {
    slug: "course-entry",
    type: "course",
    category: "视频课程",
    title: "课程",
    summary: "摘要",
    meta: "入门课程",
    sections: [],
    sourceName: "旧政策来源",
    sourceHref: "https://mp.weixin.qq.com/s/legacy",
    videoHref: "/media/videos/course.mp4",
    externalHref: "https://www.bilibili.com/video/example",
    externalLabel: "前往观看",
  } as unknown as KnowledgeEntry;

  assert.deepEqual(normalizeKnowledgeEntry(course), {
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

  assert.equal(normalizeKnowledgeEntry(course).videoHref, "");
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

  assert.deepEqual(normalizeKnowledgeEntry(course), course);
});
