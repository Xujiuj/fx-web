import { isContentSlug } from "./content-slug.ts";
import type { HomeContent, Subpage } from "./cms-content.ts";
import type { KnowledgeEntry } from "./knowledge-content.ts";
import {
  isAllowedContentHref,
  isHttpsContentUrl,
  isLocalContentPath,
  isOptionalAllowedContentHref,
} from "./media-url.ts";

export const siteContentContract = "fx-web/current-v2" as const;

export type SiteContentDocument<T> = {
  contract: typeof siteContentContract;
  data: T;
};

export function serializeSiteContentDocument<T>(data: T) {
  return JSON.stringify({ contract: siteContentContract, data } satisfies SiteContentDocument<T>, null, 2);
}

export function parseSiteContentDocument<T>(value: string): T | null {
  try {
    const document = JSON.parse(value) as Partial<SiteContentDocument<T>>;
    return document.contract === siteContentContract && document.data !== undefined ? document.data : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isOptionalIsoDate(value: unknown) {
  return value === undefined || (typeof value === "string" && Number.isFinite(Date.parse(value)));
}

function isPositiveDimension(value: unknown) {
  return value === undefined || (typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 100_000);
}

const iconKeys = new Set(["chart", "building", "database", "layers", "line", "shield", "sparkles", "users", "workflow"]);

function isSectionItem(value: unknown, kind: unknown, sectionId: string) {
  if (!isRecord(value) || typeof value.title !== "string" || !isOptionalString(value.description) || !isOptionalString(value.value)) return false;
  if (value.image !== undefined && !isLocalContentPath(value.image)) return false;
  if (value.details !== undefined && (!isRecord(value.details) || !Object.values(value.details).every((detail) => typeof detail === "string"))) return false;
  if (value.gallery !== undefined && (!Array.isArray(value.gallery) || !value.gallery.every((item) => isRecord(item) && isLocalContentPath(item.src) && (item.thumbnailSrc === undefined || isLocalContentPath(item.thumbnailSrc)) && (item.fullSrc === undefined || isLocalContentPath(item.fullSrc)) && typeof item.label === "string" && typeof item.alt === "string" && isPositiveDimension(item.width) && isPositiveDimension(item.height)))) return false;
  if ((kind === "resources" || sectionId.endsWith("-cta")) && value.value !== undefined && value.value !== "" && !isAllowedContentHref(value.value)) return false;
  return true;
}

function isNavigationItem(value: unknown) {
  return isRecord(value) && typeof value.label === "string" && isAllowedContentHref(value.href) &&
    (value.hidden === undefined || typeof value.hidden === "boolean") &&
    (value.children === undefined || (Array.isArray(value.children) && value.children.every((child) => isRecord(child) && typeof child.label === "string" && isAllowedContentHref(child.href) && (child.hidden === undefined || typeof child.hidden === "boolean") && (child.group === undefined || typeof child.group === "string"))));
}

export function validateCurrentHomeContent(home: unknown): string | null {
  if (!isRecord(home) || "schemaVersion" in home) return "首页内容不是当前系统合同";
  if (!isRecord(home.site) || typeof home.site.title !== "string" || typeof home.site.description !== "string") return "站点标题或描述无效";
  if (!isRecord(home.brand) || typeof home.brand.name !== "string" || home.brand.name.trim().length === 0 || !isLocalContentPath(home.brand.logo) || !isAllowedContentHref(home.brand.href)) return "品牌名称、主页链接或 Logo 路径无效";
  for (const key of ["navItems", "heroSlides", "aboutTabs", "timeline", "solutionItems", "newsItems", "products", "capabilities", "certificateImages", "partners"]) {
    if (!Array.isArray(home[key])) return `首页配置缺少数组字段: ${key}`;
  }
  if ((home.navItems as unknown[]).length === 0 || !(home.navItems as unknown[]).every(isNavigationItem)) return "导航菜单结构无效";
  if ((home.heroSlides as unknown[]).length === 0 || !(home.heroSlides as unknown[]).every((item) => isRecord(item) && typeof item.eyebrow === "string" && typeof item.title === "string" && typeof item.description === "string" && isLocalContentPath(item.image) && typeof item.cta === "string" && isOptionalAllowedContentHref(item.href) && isOptionalString(item.secondaryCta) && isOptionalAllowedContentHref(item.secondaryHref))) return "首页横幅结构无效";
  if (!(home.aboutTabs as unknown[]).every((item) => isRecord(item) && typeof item.value === "string" && typeof item.label === "string" && typeof item.title === "string" && typeof item.kicker === "string" && typeof item.body === "string" && (item.image === undefined || isLocalContentPath(item.image)) && isOptionalString(item.imageAlt))) return "公司介绍结构无效";
  if (!(home.timeline as unknown[]).every((item) => isRecord(item) && typeof item.year === "string" && isStringArray(item.items))) return "能力路径结构无效";
  if (home.timelineImage !== undefined && !isLocalContentPath(home.timelineImage)) return "能力路径图片必须使用站内路径";
  for (const key of ["solutionItems", "newsItems"] as const) {
    if (!(home[key] as unknown[]).every((item) => isRecord(item) && typeof item.title === "string" && typeof item.action === "string" && isLocalContentPath(item.image) && isAllowedContentHref(item.href) && isOptionalString(item.summary) && isOptionalString(item.subtitle))) return `${key === "solutionItems" ? "解决方案" : "最新动态"}结构无效`;
  }
  if (!(home.products as unknown[]).every((item) => isRecord(item) && typeof item.name === "string" && typeof item.summary === "string" && iconKeys.has(String(item.icon)) && isAllowedContentHref(item.href) && isOptionalString(item.stage) && (item.audience === undefined || isStringArray(item.audience)) && (item.tags === undefined || isStringArray(item.tags)) && isOptionalString(item.action))) return "产品入口结构无效";
  if (!isOptionalString(home.productCenterTitle) || !isOptionalString(home.productCenterDescription)) return "产品中心标题或说明无效";
  if (!(home.capabilities as unknown[]).every((item) => isRecord(item) && typeof item.label === "string" && iconKeys.has(String(item.icon)))) return "能力标签结构无效";
  if (!(home.certificateImages as unknown[]).every((item) => item === "" || isLocalContentPath(item))) return "证书图片必须使用站内路径";
  if (!(home.partners as unknown[]).every((item) => isRecord(item) && typeof item.name === "string" && (item.logo === "" || item.logo === undefined || isLocalContentPath(item.logo)))) return "伙伴结构无效";
  if (!isRecord(home.sectionTitles)) return "首页栏目标题结构无效";
  for (const key of ["timeline", "news", "products", "certificates", "partners", "thinkingEyebrow", "thinkingTitle", "contact"] as const) {
    if (typeof home.sectionTitles[key] !== "string") return `首页栏目标题无效: ${key}`;
  }
  if (!isOptionalString(home.sectionTitles.solutions) || typeof home.thinkingText !== "string") return "首页定位内容无效";
  if (!isRecord(home.contact) || !Object.values(home.contact).every((value) => typeof value === "string")) return "联系区结构无效";
  if (!isRecord(home.footer) || typeof home.footer.copyright !== "string" || typeof home.footer.icpText !== "string" || !isAllowedContentHref(home.footer.icpHref) || typeof home.footer.ipv6Text !== "string" || !isOptionalString(home.footer.wecomTitle) || !isOptionalString(home.footer.wecomDescription) || !isOptionalString(home.footer.wecomEmail) || (home.footer.wecomAvatar !== undefined && !isLocalContentPath(home.footer.wecomAvatar)) || (home.footer.wecomQr !== undefined && !isLocalContentPath(home.footer.wecomQr)) || !isOptionalAllowedContentHref(home.footer.customerServiceHref) || (home.footer.customerServiceQr !== undefined && !isLocalContentPath(home.footer.customerServiceQr)) || (home.footer.wecomOpenByDefault !== undefined && typeof home.footer.wecomOpenByDefault !== "boolean")) return "页脚或企业微信配置无效";
  if (!isRecord(home.editorial) || !isRecord(home.editorial.path) || !isRecord(home.editorial.headings) || typeof home.editorial.path.eyebrow !== "string" || typeof home.editorial.path.title !== "string" || typeof home.editorial.path.description !== "string" || typeof home.editorial.path.summary !== "string") return "首页栏目结构无效";
  for (const key of ["drivers", "challenges", "managementPath", "services", "cases"] as const) {
    const heading = home.editorial.headings[key];
    if (!isRecord(heading) || typeof heading.eyebrow !== "string" || typeof heading.title !== "string" || !isOptionalString(heading.description) || !isOptionalString(heading.summary)) return `首页栏目标题结构无效: ${key}`;
    if (!Array.isArray(home.editorial[key]) || !home.editorial[key].every((item) => isRecord(item) && typeof item.title === "string" && typeof item.description === "string" && iconKeys.has(String(item.icon)) && ((key !== "services" && key !== "cases") || isAllowedContentHref(item.href)))) return `首页栏目内容结构无效: ${key}`;
  }
  return null;
}

export function validateCurrentSubpages(subpages: unknown, templates: Subpage[]): string | null {
  if (!Array.isArray(subpages) || subpages.length !== templates.length) return "业务页面必须与当前官网模板完整一致";
  const templateBySlug = new Map(templates.map((page) => [page.slug, page]));
  const seen = new Set<string>();
  for (const page of subpages) {
    if (!isRecord(page) || "schemaVersion" in page || !isContentSlug(page.slug)) return "业务页面不是当前系统合同";
    const template = templateBySlug.get(page.slug as string);
    if (!template || seen.has(page.slug as string)) return `存在未知或重复页面: ${String(page.slug)}`;
    seen.add(page.slug as string);
    if (page.layout !== template.layout || page.icon !== template.icon || typeof page.navLabel !== "string" || typeof page.eyebrow !== "string" || typeof page.title !== "string" || typeof page.summary !== "string" || !isLocalContentPath(page.image)) return `页面基础结构无效: ${page.slug}`;
    if (!isStringArray(page.features) || !isStringArray(page.steps) || !Array.isArray(page.metrics) || !page.metrics.every((metric) => isRecord(metric) && typeof metric.label === "string" && typeof metric.value === "string")) return `页面内容结构无效: ${page.slug}`;
    if (page.media !== undefined && (!isRecord(page.media) || !Object.values(page.media).every(isLocalContentPath))) return `页面媒体结构无效: ${page.slug}`;
    if (page.product !== undefined) {
      if (!isRecord(page.product)) return `产品配置无效: ${page.slug}`;
      for (const key of ["enterpriseUrl", "trialUrl", "publicReportUrl", "videoUrl"] as const) {
        if (!isOptionalAllowedContentHref(page.product[key])) return `产品链接无效: ${page.slug}`;
      }
      if (page.product.videoPoster !== undefined && page.product.videoPoster !== "" && !isLocalContentPath(page.product.videoPoster)) return `产品视频封面无效: ${page.slug}`;
      if (page.product.screenshots !== undefined && (!Array.isArray(page.product.screenshots) || !page.product.screenshots.every((item) => isRecord(item) && isLocalContentPath(item.src) && (item.thumbnailSrc === undefined || isLocalContentPath(item.thumbnailSrc)) && (item.fullSrc === undefined || isLocalContentPath(item.fullSrc)) && typeof item.label === "string" && typeof item.alt === "string" && isPositiveDimension(item.width) && isPositiveDimension(item.height)))) return `产品截图配置无效: ${page.slug}`;
    }
    if (!Array.isArray(page.sections) || page.sections.length !== template.sections.length) return `页面模块数量与当前模板不一致: ${page.slug}`;
    for (let index = 0; index < template.sections.length; index += 1) {
      const section = page.sections[index];
      const expected = template.sections[index];
      if (!isRecord(section) || section.id !== expected.id || section.kind !== expected.kind || typeof section.title !== "string" || !isOptionalString(section.description) || !Array.isArray(section.items) || !section.items.every((item) => isSectionItem(item, section.kind, section.id as string))) return `页面模块与当前模板不一致: ${page.slug}/${expected.id}`;
    }
  }
  return seen.size === templates.length ? null : "业务页面缺少当前官网模板";
}

export function validateCurrentKnowledge(entries: unknown): string | null {
  if (!Array.isArray(entries)) return "资源中心内容必须是数组";
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (!isRecord(entry) || !isContentSlug(entry.slug) || slugs.has(entry.slug as string)) return "资源内容 URL 标识无效或重复";
    slugs.add(entry.slug as string);
    if ((entry.type !== "article" && entry.type !== "course") || typeof entry.category !== "string" || typeof entry.title !== "string" || typeof entry.summary !== "string" || typeof entry.meta !== "string" || !isOptionalIsoDate(entry.publishedAt) || !Array.isArray(entry.sections)) return `资源内容结构无效: ${entry.slug}`;
    if (entry.type === "article") {
      if (!isOptionalString(entry.sourceName) || (entry.sourceHref !== undefined && entry.sourceHref !== "" && !isHttpsContentUrl(entry.sourceHref)) || "videoHref" in entry || "externalHref" in entry || "externalLabel" in entry) return `文章字段无效: ${entry.slug}`;
    } else if (!isOptionalAllowedContentHref(entry.videoHref) || !isOptionalAllowedContentHref(entry.externalHref) || !isOptionalString(entry.externalLabel) || "sourceName" in entry || "sourceHref" in entry) {
      return `视频课程字段无效: ${entry.slug}`;
    }
    if (entry.coverImage !== undefined && entry.coverImage !== "" && !isLocalContentPath(entry.coverImage)) return `资源封面无效: ${entry.slug}`;
    if (!entry.sections.every((section) => isRecord(section) && typeof section.heading === "string" && (section.paragraphs === undefined || isStringArray(section.paragraphs)) && (section.bullets === undefined || isStringArray(section.bullets)))) return `资源正文无效: ${entry.slug}`;
  }
  return null;
}

export function validateCurrentSiteContent(home: unknown, subpages: unknown, knowledge: unknown, templates: Subpage[]) {
  return validateCurrentHomeContent(home) ?? validateCurrentSubpages(subpages, templates) ?? validateCurrentKnowledge(knowledge);
}

export function isCurrentHomeContent(value: unknown): value is HomeContent {
  return validateCurrentHomeContent(value) === null;
}

export function isCurrentSubpages(value: unknown, templates: Subpage[]): value is Subpage[] {
  return validateCurrentSubpages(value, templates) === null;
}

export function isCurrentKnowledge(value: unknown): value is KnowledgeEntry[] {
  return validateCurrentKnowledge(value) === null;
}
