import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  ContentConflictError,
  defaultHomeContent,
  defaultSubpages,
  getSiteContentBundle,
  saveSiteContentBundle,
  type ContentVersions,
  type HomeContent,
  type Subpage
} from "@/lib/cms-content";
import { knowledgeEntries as defaultKnowledgeEntries, type KnowledgeEntry } from "@/lib/knowledge-content";
import { isContentSlug } from "@/lib/content-slug";
import { cleanupManagedMedia } from "@/lib/managed-media";
import {
  isAllowedContentHref,
  isHttpsContentUrl,
  isLocalContentPath,
  isOptionalAllowedContentHref,
} from "@/lib/media-url";
import { readJsonBody } from "@/lib/request-security";

async function unauthorized() {
  return !(await isAdminAuthenticated());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

const iconKeys = new Set(["chart", "building", "database", "layers", "line", "shield", "sparkles", "users", "workflow"]);
const subpageLayouts = new Set(["training", "practical", "consulting", "solution-platform", "excel", "product-platform", "cases", "knowledge", "company", "honors", "partners", "contact", "service"]);
const sectionKinds = new Set(["metrics", "capabilities", "process", "resources", "timeline", "gallery", "contacts"]);

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isPositiveDimension(value: unknown) {
  return value === undefined || (typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 100_000);
}

function isSectionItem(value: unknown, kind: unknown, sectionId: string) {
  if (!isRecord(value) || typeof value.title !== "string" || !isOptionalString(value.description) || !isOptionalString(value.value)) return false;
  if (value.image !== undefined && !isLocalContentPath(value.image)) return false;
  if (value.details !== undefined && (!isRecord(value.details) || !Object.values(value.details).every((detail) => typeof detail === "string"))) return false;
  if ((kind === "resources" || sectionId.endsWith("-cta")) && value.value !== undefined && value.value !== "" && !isAllowedContentHref(value.value)) return false;
  return true;
}

function isSubpageSection(value: unknown) {
  return isRecord(value) && isContentSlug(value.id) &&
    sectionKinds.has(String(value.kind)) && typeof value.title === "string" && isOptionalString(value.description) &&
    Array.isArray(value.items) && value.items.every((item) => isSectionItem(item, value.kind, value.id as string));
}

function isMediaMap(value: unknown) {
  return isRecord(value) && Object.values(value).every(isLocalContentPath);
}

function isNavigationItem(value: unknown) {
  return isRecord(value) && typeof value.label === "string" && isAllowedContentHref(value.href) &&
    (value.hidden === undefined || typeof value.hidden === "boolean") &&
    (value.children === undefined || (Array.isArray(value.children) && value.children.every((child) => isRecord(child) && typeof child.label === "string" && isAllowedContentHref(child.href) && (child.hidden === undefined || typeof child.hidden === "boolean") && (child.group === undefined || typeof child.group === "string"))));
}

function validateContent(home: unknown, subpages: unknown, knowledge: unknown): string | null {
  if (!isRecord(home) || !isRecord(home.site) || typeof home.site.title !== "string" || typeof home.site.description !== "string") return "站点标题或描述无效";
  if (!isRecord(home.brand) || typeof home.brand.name !== "string" || home.brand.name.trim().length === 0 || !isLocalContentPath(home.brand.logo) || !isAllowedContentHref(home.brand.href)) return "品牌名称、主页链接或 Logo 路径无效";
  for (const key of ["navItems", "heroSlides", "aboutTabs", "timeline", "solutionItems", "newsItems", "products", "capabilities", "certificateImages", "partners"]) {
    if (!Array.isArray(home[key])) return "首页配置缺少数组字段: " + key;
  }
  if ((home.navItems as unknown[]).length === 0) return "主导航至少保留一项";
  if ((home.heroSlides as unknown[]).length === 0) return "首页横幅至少保留一项";
  if (!(home.navItems as unknown[]).every(isNavigationItem)) return "导航菜单结构无效";
  if (!(home.heroSlides as unknown[]).every((item) => isRecord(item) && typeof item.eyebrow === "string" && typeof item.title === "string" && typeof item.description === "string" && isLocalContentPath(item.image) && typeof item.cta === "string" && isOptionalAllowedContentHref(item.href) && isOptionalString(item.secondaryCta) && isOptionalAllowedContentHref(item.secondaryHref))) return "轮播内容、链接或图片路径无效";
  if (!(home.aboutTabs as unknown[]).every((item) => isRecord(item) && typeof item.value === "string" && typeof item.label === "string" && typeof item.title === "string" && typeof item.kicker === "string" && typeof item.body === "string" && (item.image === undefined || isLocalContentPath(item.image)) && isOptionalString(item.imageAlt))) return "关于我们内容或图片路径无效";
  if (!(home.timeline as unknown[]).every((item) => isRecord(item) && typeof item.year === "string" && isStringArray(item.items))) return "能力路径结构无效";
  if (home.timelineImage !== undefined && !isLocalContentPath(home.timelineImage)) return "能力路径图片必须使用站内路径";
  if (!(home.solutionItems as unknown[]).every((item) => isRecord(item) && typeof item.title === "string" && item.title.trim().length > 0 && typeof item.action === "string" && isLocalContentPath(item.image) && isAllowedContentHref(item.href) && isOptionalString(item.summary) && isOptionalString(item.subtitle))) return "解决方案内容、链接或图片路径无效";
  if (!(home.newsItems as unknown[]).every((item) => isRecord(item) && typeof item.title === "string" && item.title.trim().length > 0 && typeof item.action === "string" && isLocalContentPath(item.image) && isAllowedContentHref(item.href) && isOptionalString(item.summary) && isOptionalString(item.subtitle))) return "最新动态内容、链接或图片路径无效";
  if (!(home.products as unknown[]).every((item) => isRecord(item) && typeof item.name === "string" && typeof item.summary === "string" && iconKeys.has(String(item.icon)) && isAllowedContentHref(item.href))) return "产品入口结构无效";
  if (!(home.capabilities as unknown[]).every((item) => isRecord(item) && typeof item.label === "string" && iconKeys.has(String(item.icon)))) return "能力标签结构无效";
  if (!(home.certificateImages as unknown[]).every((item) => item === "" || isLocalContentPath(item))) return "证书图片必须使用站内路径";
  if (!(home.partners as unknown[]).every((item) => isRecord(item) && typeof item.name === "string" && (item.logo === "" || item.logo === undefined || isLocalContentPath(item.logo)))) return "伙伴名称或 Logo 路径无效";
  if (!isRecord(home.contact) || !Object.values(home.contact).every((value) => typeof value === "string")) return "联系区文案结构无效";
  if (!isRecord(home.footer) || typeof home.footer.copyright !== "string" || typeof home.footer.icpText !== "string" || !isAllowedContentHref(home.footer.icpHref) || typeof home.footer.ipv6Text !== "string" || !isOptionalString(home.footer.wecomTitle) || !isOptionalString(home.footer.wecomDescription) || (home.footer.wecomEmail !== undefined && home.footer.wecomEmail !== "service@fengxingdata.com") || (home.footer.wecomAvatar !== undefined && !isLocalContentPath(home.footer.wecomAvatar)) || (home.footer.wecomQr !== undefined && !isLocalContentPath(home.footer.wecomQr)) || !isOptionalAllowedContentHref(home.footer.customerServiceHref) || (home.footer.customerServiceQr !== undefined && !isLocalContentPath(home.footer.customerServiceQr)) || (home.footer.wecomOpenByDefault !== undefined && typeof home.footer.wecomOpenByDefault !== "boolean")) return "页脚或企业微信配置无效";
  if (!isRecord(home.editorial) || !isRecord(home.editorial.path) || !isRecord(home.editorial.headings)) return "首页内容结构无效";
  for (const key of ["drivers", "challenges", "managementPath", "services", "cases"] as const) {
    const heading = home.editorial.headings[key];
    if (!isRecord(heading) || typeof heading.eyebrow !== "string" || typeof heading.title !== "string") return "首页栏目标题结构无效: " + key;
  }
  for (const key of ["drivers", "challenges", "managementPath", "services", "cases"] as const) {
    if (!Array.isArray(home.editorial[key]) || !home.editorial[key].every((item) => isRecord(item) && typeof item.title === "string" && typeof item.description === "string" && iconKeys.has(String(item.icon)) && ((key !== "services" && key !== "cases") || isAllowedContentHref(item.href)))) return "首页内容结构无效: " + key;
  }
  if (!Array.isArray(subpages)) return "子页面配置必须是数组";

  const slugs = new Set<string>();
  for (const page of subpages) {
    if (!isRecord(page) || !isContentSlug(page.slug)) return "子页面 slug 只能使用小写字母、数字和单个连字符分隔";
    if (slugs.has(page.slug)) return "子页面 slug 不能重复: " + page.slug;
    slugs.add(page.slug);
    if (!subpageLayouts.has(String(page.layout)) || !iconKeys.has(String(page.icon)) || typeof page.navLabel !== "string" || typeof page.eyebrow !== "string" || typeof page.title !== "string" || typeof page.summary !== "string" || !isLocalContentPath(page.image)) return "子页面基础配置无效: " + page.slug;
    if (!isStringArray(page.features) || !isStringArray(page.steps) || !Array.isArray(page.metrics) || !page.metrics.every((metric) => isRecord(metric) && typeof metric.label === "string" && typeof metric.value === "string")) return "子页面指标、内容或步骤结构无效: " + page.slug;
    if (page.media !== undefined && !isMediaMap(page.media)) return "子页面媒体路径无效: " + page.slug;
    if (page.product !== undefined) {
      if (!isRecord(page.product)) return "产品配置无效: " + page.slug;
      for (const key of ["enterpriseUrl", "trialUrl", "publicReportUrl"] as const) {
        if (!isOptionalAllowedContentHref(page.product[key])) return "产品链接必须是站内路径或 https 地址: " + page.slug;
      }
      if (!isOptionalAllowedContentHref(page.product.videoUrl)) return "产品视频必须使用站内路径或 https 地址: " + page.slug;
      if (page.product.videoPoster !== undefined && page.product.videoPoster !== "" && !isLocalContentPath(page.product.videoPoster)) return "产品视频封面必须使用站内路径: " + page.slug;
      if (page.product.screenshots !== undefined && (!Array.isArray(page.product.screenshots) || !page.product.screenshots.every((item) => isRecord(item) && isLocalContentPath(item.src) && (item.thumbnailSrc === undefined || isLocalContentPath(item.thumbnailSrc)) && (item.fullSrc === undefined || isLocalContentPath(item.fullSrc)) && typeof item.label === "string" && typeof item.alt === "string" && isPositiveDimension(item.width) && isPositiveDimension(item.height)))) return "产品截图配置无效: " + page.slug;
    }
    if (!Array.isArray(page.sections) || !page.sections.every(isSubpageSection)) {
      return "子页面模块结构、下载链接或图片路径无效: " + page.slug;
    }
  }
  if (!Array.isArray(knowledge)) return "资料中心配置必须是数组";
  const knowledgeSlugs = new Set<string>();
  for (const entry of knowledge) {
    if (!isRecord(entry) || !isContentSlug(entry.slug)) return "知识内容 URL 标识只能使用小写字母、数字和单个连字符分隔";
    if (knowledgeSlugs.has(entry.slug)) return "知识内容 URL 标识不能重复: " + entry.slug;
    knowledgeSlugs.add(entry.slug);
    if ((entry.type !== "article" && entry.type !== "course") || typeof entry.category !== "string" || typeof entry.title !== "string" || typeof entry.summary !== "string" || typeof entry.meta !== "string" || !Array.isArray(entry.sections)) return "知识内容结构无效: " + entry.slug;
    if (entry.type === "article") {
      if (!isOptionalString(entry.sourceName) || (entry.sourceHref !== undefined && entry.sourceHref !== "" && !isHttpsContentUrl(entry.sourceHref)) || (entry.videoHref !== undefined && entry.videoHref !== "") || (entry.externalHref !== undefined && entry.externalHref !== "") || (entry.externalLabel !== undefined && entry.externalLabel !== "")) return "文章只能配置政策原文，不能绑定课程视频: " + entry.slug;
    } else if (!isOptionalAllowedContentHref(entry.videoHref) || !isOptionalAllowedContentHref(entry.externalHref) || !isOptionalString(entry.externalLabel) || (entry.sourceName !== undefined && entry.sourceName !== "") || (entry.sourceHref !== undefined && entry.sourceHref !== "")) {
      return "视频课程只能配置课程视频，不能绑定政策原文: " + entry.slug;
    }
    if (entry.coverImage !== undefined && entry.coverImage !== "" && !isLocalContentPath(entry.coverImage)) return "课程封面必须使用站内路径: " + entry.slug;
    if (!entry.sections.every((section) => isRecord(section) && typeof section.heading === "string" && (section.paragraphs === undefined || (Array.isArray(section.paragraphs) && section.paragraphs.every((value) => typeof value === "string"))) && (section.bullets === undefined || (Array.isArray(section.bullets) && section.bullets.every((value) => typeof value === "string"))))) return "知识内容正文无效: " + entry.slug;
  }
  return null;
}

export async function GET() {
  if (await unauthorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getSiteContentBundle());
}

export async function POST(request: Request) {
  if (await unauthorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await readJsonBody<{
      home?: unknown;
      subpages?: unknown;
      knowledge?: unknown;
      versions?: ContentVersions;
      reset?: boolean;
    }>(request, 512 * 1024);
    if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });
    const payload = body.value;

    if (!payload.versions) return NextResponse.json({ error: "Missing content versions" }, { status: 400 });

    const bundle = payload.reset
      ? { home: defaultHomeContent, subpages: defaultSubpages, knowledge: defaultKnowledgeEntries }
      : { home: payload.home as HomeContent, subpages: payload.subpages as Subpage[], knowledge: payload.knowledge as KnowledgeEntry[] };

    const validationError = validateContent(bundle.home, bundle.subpages, bundle.knowledge);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const previousBundle = await getSiteContentBundle();
    const versions = await saveSiteContentBundle(bundle, payload.versions);
    try {
      const cleanup = await cleanupManagedMedia(previousBundle, bundle);
      if (cleanup.failed > 0) {
        console.error("[admin-content] managed media cleanup incomplete", {
          event: "MANAGED_MEDIA_CLEANUP_INCOMPLETE",
          deleted: cleanup.deleted,
          failed: cleanup.failed,
          scanned: cleanup.scanned,
        });
      }
    } catch {
      console.error("[admin-content] managed media cleanup failed", {
        event: "MANAGED_MEDIA_CLEANUP_FAILED",
      });
    }
    return NextResponse.json({ ok: true, versions });
  } catch (error) {
    if (error instanceof ContentConflictError) {
      return NextResponse.json(
        { error: "内容已被其他管理员修改，请刷新后重试。", current: await getSiteContentBundle() },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "保存内容失败，请检查内容后重试。" },
      { status: 400 }
    );
  }
}
