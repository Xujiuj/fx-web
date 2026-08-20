import assert from "node:assert/strict";
import test from "node:test";
import {
  parseSiteContentDocument,
  serializeSiteContentDocument,
  validateCurrentHomeContent,
  validateCurrentSubpages,
} from "../lib/site-content-contract.ts";
import type { HomeContent, Subpage } from "../lib/cms-content.ts";

function currentHome(): HomeContent {
  return {
    site: { title: "站点", description: "描述" },
    brand: { name: "品牌", logo: "/media/logo.png", href: "/" },
    navItems: [{ label: "首页", href: "/" }],
    heroSlides: [{ eyebrow: "定位", title: "标题", description: "描述", image: "/media/hero.png", cta: "查看", href: "/solution" }],
    aboutTabs: [],
    timeline: [{ year: "01", items: ["准备"] }],
    solutionItems: [],
    newsItems: [],
    products: [],
    capabilities: [],
    certificateImages: [],
    partners: [],
    sectionTitles: { timeline: "路径", news: "动态", products: "产品", certificates: "资质", partners: "伙伴", thinkingEyebrow: "POSITION", thinkingTitle: "定位", contact: "联系" },
    thinkingText: "定位说明",
    contact: { title: "联系", description: "说明", namePlaceholder: "联系人", companyPlaceholder: "企业", contactPlaceholder: "联系方式", emailPlaceholder: "邮箱", messagePlaceholder: "需求", submitLabel: "提交", successLabel: "成功", errorLabel: "失败" },
    footer: { copyright: "版权所有", icpText: "备案", icpHref: "https://beian.miit.gov.cn/", ipv6Text: "邮箱" },
    editorial: {
      path: { eyebrow: "PATH", title: "路径", description: "描述", summary: "说明" },
      headings: {
        drivers: { eyebrow: "DRIVERS", title: "驱动" },
        challenges: { eyebrow: "CHALLENGES", title: "挑战" },
        managementPath: { eyebrow: "PATH", title: "路径" },
        services: { eyebrow: "SERVICES", title: "服务" },
        cases: { eyebrow: "CASES", title: "案例" },
      },
      drivers: [],
      challenges: [],
      managementPath: [],
      services: [],
      cases: [],
    },
  };
}

function currentPage(slug: string, sections: Subpage["sections"]): Subpage {
  return {
    slug,
    layout: "service",
    navLabel: "页面",
    eyebrow: "PAGE",
    title: "页面",
    summary: "说明",
    image: "/media/page.png",
    icon: "workflow",
    metrics: [],
    features: [],
    steps: [],
    sections,
  };
}

test("serializes and parses the current content document", () => {
  const value = [{ title: "当前内容" }];
  assert.deepEqual(parseSiteContentDocument(serializeSiteContentDocument(value)), value);
});

test("rejects unversioned and differently contracted documents", () => {
  assert.equal(parseSiteContentDocument(JSON.stringify([{ title: "裸数组" }])), null);
  assert.equal(parseSiteContentDocument(JSON.stringify({ contract: "fx-web/v0", data: [] })), null);
  assert.equal(parseSiteContentDocument("not-json"), null);
});

test("rejects schema-versioned home content", () => {
  const home = { ...currentHome(), schemaVersion: 2 };
  assert.match(validateCurrentHomeContent(home) ?? "", /不是当前系统合同/);
  assert.equal(validateCurrentHomeContent(currentHome()), null);
});

test("rejects incomplete current home content", () => {
  const { sectionTitles: _, ...home } = currentHome();
  assert.match(validateCurrentHomeContent(home) ?? "", /栏目标题结构无效/);
});

test("requires every current page and its fixed layout", () => {
  const sections = [{ id: "overview", kind: "capabilities" as const, title: "概览", items: [] }];
  const templates = [currentPage("service-one", sections), currentPage("service-two", sections)];
  assert.equal(validateCurrentSubpages(structuredClone(templates), templates), null);
  assert.match(validateCurrentSubpages([structuredClone(templates[0])], templates) ?? "", /完整一致/);

  const changedLayout = structuredClone(templates);
  changedLayout[0].layout = "training";
  assert.match(validateCurrentSubpages(changedLayout, templates) ?? "", /基础结构无效/);
});

test("rejects a changed section identity or order", () => {
  const sections = [
    { id: "overview", kind: "capabilities" as const, title: "概览", items: [] },
    { id: "process", kind: "process" as const, title: "流程", items: [] },
  ];
  const templates = [currentPage("service-one", sections)];
  const changedId = structuredClone(templates);
  changedId[0].sections[0].id = "renamed";
  assert.match(validateCurrentSubpages(changedId, templates) ?? "", /模块与当前模板不一致/);

  const reordered = structuredClone(templates);
  reordered[0].sections.reverse();
  assert.match(validateCurrentSubpages(reordered, templates) ?? "", /模块与当前模板不一致/);
});
