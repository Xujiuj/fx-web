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
import { readJsonBody } from "@/lib/request-security";

async function unauthorized() {
  return !(await isAdminAuthenticated());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isLocalPath(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

function isMediaMap(value: unknown) {
  return isRecord(value) && Object.values(value).every(isLocalPath);
}

function isNavigationItem(value: unknown) {
  return isRecord(value) && typeof value.label === "string" && typeof value.href === "string" &&
    (value.hidden === undefined || typeof value.hidden === "boolean") &&
    (value.children === undefined || (Array.isArray(value.children) && value.children.every((child) => isRecord(child) && typeof child.label === "string" && typeof child.href === "string" && (child.hidden === undefined || typeof child.hidden === "boolean") && (child.group === undefined || typeof child.group === "string"))));
}

function validateContent(home: unknown, subpages: unknown): string | null {
  if (!isRecord(home) || !isRecord(home.site) || typeof home.site.title !== "string" || typeof home.site.description !== "string") return "站点标题或描述无效";
  if (!isRecord(home.brand) || !isLocalPath(home.brand.logo)) return "品牌配置或 Logo 路径无效";
  for (const key of ["navItems", "heroSlides", "aboutTabs", "timeline", "solutionItems", "newsItems", "products", "capabilities", "certificateImages", "partners"]) {
    if (!Array.isArray(home[key])) return "首页配置缺少数组字段: " + key;
  }
  if (!(home.navItems as unknown[]).every(isNavigationItem)) return "导航菜单结构无效";
  if (!(home.heroSlides as unknown[]).every((item) => isRecord(item) && isLocalPath(item.image) && typeof item.cta === "string" && (item.href === undefined || typeof item.href === "string") && (item.secondaryCta === undefined || typeof item.secondaryCta === "string") && (item.secondaryHref === undefined || typeof item.secondaryHref === "string"))) return "轮播内容或图片路径无效";
  if (!(home.aboutTabs as unknown[]).every((item) => isRecord(item) && (item.image === undefined || isLocalPath(item.image)))) return "关于我们图片必须使用站内路径";
  if (home.timelineImage !== undefined && !isLocalPath(home.timelineImage)) return "能力路径图片必须使用站内路径";
  if (!(home.solutionItems as unknown[]).every((item) => isRecord(item) && isLocalPath(item.image))) return "解决方案图片必须使用站内路径";
  if (!(home.newsItems as unknown[]).every((item) => isRecord(item) && isLocalPath(item.image))) return "动态图片必须使用站内路径";
  if (!(home.certificateImages as unknown[]).every((item) => item === "" || isLocalPath(item))) return "证书图片必须使用站内路径";
  if (!(home.partners as unknown[]).every((item) => isRecord(item) && typeof item.name === "string" && (item.logo === "" || item.logo === undefined || isLocalPath(item.logo)))) return "伙伴名称或 Logo 路径无效";
  if (!Array.isArray(subpages)) return "子页面配置必须是数组";

  const slugs = new Set<string>();
  for (const page of subpages) {
    if (!isRecord(page) || typeof page.slug !== "string" || !/^[a-z0-9-]+$/.test(page.slug)) return "子页面 slug 只能包含小写字母、数字和连字符";
    if (slugs.has(page.slug)) return "子页面 slug 不能重复: " + page.slug;
    slugs.add(page.slug);
    if (typeof page.title !== "string" || !isLocalPath(page.image)) return "子页面标题或图片路径无效: " + page.slug;
    if (!Array.isArray(page.features) || !Array.isArray(page.steps) || !Array.isArray(page.metrics)) return "子页面结构无效: " + page.slug;
    if (page.media !== undefined && !isMediaMap(page.media)) return "子页面媒体路径无效: " + page.slug;
    if (page.sections !== undefined && (!Array.isArray(page.sections) || !page.sections.every((section) => isRecord(section) && Array.isArray(section.items) && section.items.every((item) => isRecord(item) && (item.image === undefined || isLocalPath(item.image)))))) {
      return "子页面模块图片路径无效: " + page.slug;
    }
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
      versions?: ContentVersions;
      reset?: boolean;
    }>(request, 512 * 1024);
    if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });
    const payload = body.value;

    if (!payload.versions) return NextResponse.json({ error: "Missing content versions" }, { status: 400 });

    const bundle = payload.reset
      ? { home: defaultHomeContent, subpages: defaultSubpages }
      : { home: payload.home as HomeContent, subpages: payload.subpages as Subpage[] };

    const validationError = validateContent(bundle.home, bundle.subpages);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const versions = await saveSiteContentBundle(bundle, payload.versions);
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
