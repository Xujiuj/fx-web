import { prisma } from "@/lib/prisma";
import { isContentSlug } from "@/lib/content-slug";
import { knowledgeEntries as defaultKnowledgeEntries, normalizeKnowledgeEntry, type KnowledgeEntry } from "@/lib/knowledge-content";
import { migrateSolutionDiagramBinding, migrateStoredSubpage } from "@/lib/subpage-migration";
export type IconKey = "chart" | "building" | "database" | "layers" | "line" | "shield" | "sparkles" | "users" | "workflow";

export type NavChild = { label: string; href: string; hidden?: boolean; group?: string };
export type NavItem = { label: string; href: string; hidden?: boolean; children?: NavChild[] };
export type HeroSlide = { eyebrow: string; title: string; description: string; image: string; cta: string; href?: string; secondaryCta?: string; secondaryHref?: string };
export type AboutTab = { value: string; label: string; title: string; kicker: string; body: string; image?: string; imageAlt?: string };
export type TimelineEntry = { year: string; items: string[] };
export type NewsItem = { title: string; action: string; image: string; href: string; summary?: string; subtitle?: string };
export type ProductItem = { name: string; summary: string; icon: IconKey; href: string };
export type CapabilityItem = { label: string; icon: IconKey };
export type PartnerItem = { name: string; logo?: string };
export type PageMedia = Record<string, string>;
export type FooterContent = {
  copyright: string;
  icpText: string;
  icpHref: string;
  ipv6Text: string;
  wecomTitle?: string;
  wecomDescription?: string;
  wecomEmail?: string;
  wecomAvatar?: string;
  wecomQr?: string;
  customerServiceHref?: string;
  customerServiceQr?: string;
  wecomOpenByDefault?: boolean;
};
export type ContactContent = { title: string; description: string; namePlaceholder: string; companyPlaceholder: string; contactPlaceholder: string; emailPlaceholder: string; messagePlaceholder: string; submitLabel: string; successLabel: string; errorLabel: string };

export type HomeContent = {
  schemaVersion?: number;
  site: { title: string; description: string };
  brand: { name: string; logo: string; href: string };
  navItems: NavItem[];
  heroSlides: HeroSlide[];
  aboutTabs: AboutTab[];
  timeline: TimelineEntry[];
  timelineImage?: string;
  solutionItems: NewsItem[];
  newsItems: NewsItem[];
  products: ProductItem[];
  capabilities: CapabilityItem[];
  certificateImages: string[];
  partners: PartnerItem[];
  sectionTitles: { timeline: string; solutions?: string; news: string; products: string; certificates: string; partners: string; thinkingEyebrow: string; thinkingTitle: string; contact: string };
  thinkingText: string;
  contact: ContactContent;
  footer: FooterContent;
  editorial: HomeEditorialContent;
};

export type HomeEditorialContent = {
  path: {
    eyebrow: string;
    title: string;
    description: string;
    summary: string;
  };
  headings: Record<"drivers" | "challenges" | "managementPath" | "services" | "cases", {
    eyebrow: string;
    title: string;
    description?: string;
    summary?: string;
  }>;
  drivers: Array<{ title: string; description: string; icon: IconKey }>;
  challenges: Array<{ title: string; description: string; icon: IconKey }>;
  managementPath: Array<{ title: string; description: string; icon: IconKey }>;
  services: Array<{ title: string; description: string; href: string; icon: IconKey }>;
  cases: Array<{ title: string; description: string; href: string; icon: IconKey }>;
};

export type SubpageLayout = "training" | "practical" | "consulting" | "solution-platform" | "excel" | "product-platform" | "cases" | "knowledge" | "company" | "honors" | "partners" | "contact" | "service";
export type SubpageSection = {
  id: string;
  kind: "metrics" | "capabilities" | "process" | "resources" | "timeline" | "gallery" | "contacts";
  title: string;
  description?: string;
  items: Array<{ title: string; description?: string; value?: string; image?: string; details?: Record<string, string> }>;
};

export type ProductScreenshot = { src: string; thumbnailSrc?: string; fullSrc?: string; label: string; alt: string; width?: number; height?: number };
export type ProductPageConfig = {
  screenshots?: ProductScreenshot[];
  videoUrl?: string;
  videoPoster?: string;
  enterpriseUrl?: string;
  trialUrl?: string;
  publicReportUrl?: string;
};

export type Subpage = {
  schemaVersion?: number;
  slug: string;
  layout: SubpageLayout;
  navLabel: string;
  eyebrow: string;
  title: string;
  summary: string;
  image: string;
  icon: IconKey;
  metrics: Array<{ label: string; value: string }>;
  features: string[];
  steps: string[];
  sections: SubpageSection[];
  media?: PageMedia;
  product?: ProductPageConfig;
};

type StoredSubpage = Omit<Subpage, "layout" | "sections"> & Partial<Pick<Subpage, "layout" | "sections">>;

const heroVisual = "/media/fengxing-hero-accounting.png";
const heroPlatform = "/media/fengxing-hero-management.png";
const platformImage = heroVisual;
const dataImage = heroPlatform;
const excelImage = "/media/about-philosophy-generated.png";
const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
const contentSchemaVersion = 2;
const knowledgeContentSchemaVersion = 3;
const subpageContentSchemaVersion = 6;
const legacyPlatformIsolationDescription = "公开数据报告通过 Power BI 提供浏览；企业端作为独立应用部署，与官网服务和数据完全隔离。";
const platformDemoDescription = "公开数据报告通过 Power BI 提供浏览；企业端演示入口用于查看平台界面，试用账号需提交申请后审核开通。";
const standardFooter: FooterContent = {
  copyright: "© 新疆峰行智成数据科技有限责任公司 版权所有",
  icpText: "新ICP备2026004234号-1",
  icpHref: "https://beian.miit.gov.cn/",
  ipv6Text: "邮箱：service@fengxingdata.com",
  wecomTitle: "您的企业碳管理顾问",
  wecomDescription: "扫码添加企业微信",
  wecomEmail: "service@fengxingdata.com",
  wecomAvatar: "/materials/20260803/资料20260803/网站右下角二维码/人像.jpg",
  wecomQr: "/materials/20260803/资料20260803/网站右下角二维码/企业微信二维码.png",
  customerServiceHref: "https://work.weixin.qq.com/kfid/kfc4818c444c803614c",
  customerServiceQr: "/materials/20260813/customer-service-qr.png",
  wecomOpenByDefault: false
};

const canonicalEmail = "service@fengxingdata.com";
const companyEmailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

const legacyB2BMedia: Record<string, string> = {
  "/media/candidate-team-1.jpg": excelImage,
  "/media/candidate-engineer-1.jpg": dataImage,
  "/media/candidate-plans-1.jpg": platformImage,
  "/media/about-vision.jpg": "/media/about-vision-generated.png",
  "/media/fengxing-data.jpg": dataImage,
  "/media/fengxing-excel.jpg": excelImage,
  "/media/fengxing-platform.jpg": platformImage,
  "/media/hero-carbon-warm.jpg": heroVisual,
  "/media/hero-carbon-enterprise.png": heroVisual,
  "/media/path-carbon-warm.jpg": heroVisual
};

const legacyCertificateImages = new Set([
  "/media/cert-1.png",
  "/media/cert-2.png",
  "/media/cert-3.png",
  "/media/cert-4.png",
  "/media/cert-5.png"
]);
const legacyPartnerLabels = new Set(["制造企业", "集团企业", "园区平台", "咨询机构", "产业链伙伴"]);
const defaultPageMedia: Record<string, PageMedia> = {
  "solution-standard": { diagram: "/media/reference-diagrams/service-process.svg" },
  "solution-practical": { diagram: "/media/reference-diagrams/carbon-data-governance.svg" },
  "solution-consulting": { diagram: "/media/reference-diagrams/group-implementation.svg" },
  "solution-platform": { diagram: "/media/reference-diagrams/platform-architecture.svg" },
  "excel-accounting-tool": { screenshot: "/media/product-excel-report.webp", diagram: "/media/reference-diagrams/excel-standard-flow.svg" },
  "carbon-management-platform": { screenshot: "/media/product-platform-dashboard.webp", diagram: "/media/reference-diagrams/platform-architecture.svg" },
  "customer-cases": {
    hero: "/media/manufacturing-carbon-case-hero-warm.png",
    accounting: "/media/manufacturing-carbon-accounting.png",
    governance: "/media/manufacturing-carbon-governance.png",
    analytics: "/media/manufacturing-carbon-analytics.png",
    operations: "/media/manufacturing-carbon-operations.png"
  }
};

const solutionDiagramMigrations = [
  {
    slug: "solution-standard",
    fromImage: "/materials/20260803/资料20260803/解决方案/课程宣传图制作_企业温室气体核算实战（Excel版）_扩展版.svg",
    toImage: "/media/reference-diagrams/service-process.svg",
    fromTitle: "企业温室气体核算实战（Excel版）",
    toTitle: "企业碳管理能力建设路线图",
    fromDescription: "围绕组织边界、排放源识别、活动数据整理、排放因子选择与Excel核算实操组织课程内容。",
    toDescription: "从启动准备、培训赋能到实际应用，明确企业建立温室气体核算能力的推进路径。",
  },
  {
    slug: "solution-practical",
    fromImage: "/media/reference-diagrams/agile-implementation.svg",
    toImage: "/media/reference-diagrams/carbon-data-governance.svg",
    fromTitle: "企业温室气体核算敏捷实施技术路线",
    toTitle: "企业碳数据治理与标准体系",
    fromDescription: "从项目准备、数据建模到成果交付，明确首次核算闭环各阶段的工作事项与交付结果。",
    toDescription: "将数据标准、核算规则和管理应用纳入统一体系，支撑长期维护和持续分析。",
  },
  {
    slug: "solution-platform",
    fromImage: "/media/reference-diagrams/carbon-data-governance.svg",
    toImage: "/media/reference-diagrams/platform-architecture.svg",
    fromTitle: "企业碳数据治理与标准体系",
    toTitle: "企业碳管理平台架构图",
    fromDescription: "将数据标准、核算规则和管理应用纳入统一体系，支撑长期维护和持续分析。",
    toDescription: "以统一数据体系、核算引擎和分析应用为主线，展示企业碳管理平台的技术路线与功能协同关系。",
  },
  {
    slug: "solution-platform",
    fromImage: "/media/reference-diagrams/agile-implementation.svg",
    toImage: "/media/reference-diagrams/platform-architecture.svg",
    fromTitle: "企业温室气体核算敏捷实施技术路线",
    toTitle: "企业碳管理平台架构图",
    fromDescription: "从项目准备、数据建模到成果交付，明确首次核算闭环各阶段的工作事项与交付结果。",
    toDescription: "以统一数据体系、核算引擎和分析应用为主线，展示企业碳管理平台的技术路线与功能协同关系。",
  },
] as const;

const derivedDisplayMedia: Record<string, string> = {
  "/media/reference-diagrams/three-layer-implementation.svg": "/media/derived/service-diagrams/three-layer-implementation-1800.webp",
  "/media/reference-diagrams/service-process.svg": "/media/derived/service-diagrams/service-process-1800.webp",
  "/media/reference-diagrams/platform-function-architecture.svg": "/media/derived/service-diagrams/platform-function-architecture-1800.webp",
  "/media/platform-advantages/business-data-flow.png": "/media/derived/platform-advantages/business-data-flow-gallery-1920.webp",
  "/media/platform-advantages/reuse-standard-output.png": "/media/derived/platform-advantages/reuse-standard-output-gallery-1920.webp",
  "/media/platform-advantages/reuse-activity-data.png": "/media/derived/platform-advantages/reuse-activity-data-gallery-1920.webp",
  "/media/platform-advantages/reuse-trend-analysis.png": "/media/derived/platform-advantages/reuse-trend-analysis-gallery-1920.webp",
  "/media/platform-advantages/reuse-baseline-analysis.png": "/media/derived/platform-advantages/reuse-baseline-analysis-gallery-1920.webp",
  "/media/platform-advantages/traceability-module-map.png": "/media/derived/platform-advantages/traceability-module-map-gallery-1920.webp"
};

function b2bMedia(src: string) {
  return legacyB2BMedia[src] ?? src;
}

function heroMedia(src: string) {
  return b2bMedia(src);
}

function normalizeHomeContent(content: HomeContent): HomeContent {
  const storedNews = content.newsItems ?? [];
  const usesCurrentSchema = content.schemaVersion === contentSchemaVersion;
  const storedPartners: unknown[] = Array.isArray(content.partners) ? content.partners : [];
  const hasLegacySolutionItems = storedNews.length > 0 && storedNews.every((item) => item.href.startsWith("/solution-"));
  const storedEditorial = content.editorial;
  const footer = { ...standardFooter, ...(content.footer ?? {}) };
  const storedLogo = content.brand?.logo;

  return {
    ...content,
    site: { ...defaultHomeContent.site, ...content.site },
    brand: {
      ...defaultHomeContent.brand,
      ...content.brand,
      logo: !storedLogo || storedLogo === "/media/fengxing-logo.png"
        ? "/media/fengxing-logo-transparent.png"
        : storedLogo
    },
    navItems: usesCurrentSchema && Array.isArray(content.navItems)
      ? content.navItems.map((item) => item.href === "/knowledge-center" && (item.label === "知识课堂" || item.label === "资料中心") ? { ...item, label: "资源中心" } : item)
      : content.navItems?.length ? content.navItems.map((item) => item.href === "/knowledge-center" && (item.label === "知识课堂" || item.label === "资料中心") ? { ...item, label: "资源中心" } : item) : cloneDefaultNavItems(),
    contact: {
      ...defaultHomeContent.contact,
      ...content.contact,
      description: (content.contact?.description ?? defaultHomeContent.contact.description)
        .replace(companyEmailPattern, canonicalEmail)
    },
    footer: {
      ...footer,
      ipv6Text: footer.ipv6Text.replace(companyEmailPattern, canonicalEmail),
      wecomEmail: canonicalEmail
    },
    heroSlides: (usesCurrentSchema && Array.isArray(content.heroSlides)
      ? content.heroSlides
      : content.heroSlides?.length ? content.heroSlides : defaultHomeContent.heroSlides).map((slide) => ({
      ...slide,
      image: heroMedia(slide.image)
    })),
    aboutTabs: (usesCurrentSchema && Array.isArray(content.aboutTabs)
      ? content.aboutTabs
      : content.aboutTabs?.length ? content.aboutTabs : defaultHomeContent.aboutTabs).map((tab) => {
      const fallback = defaultHomeContent.aboutTabs.find((entry) => entry.value === tab.value);
      return {
        ...tab,
        image: tab.image ?? fallback?.image,
        imageAlt: tab.imageAlt ?? fallback?.imageAlt ?? tab.title
      };
    }),
    timeline: (usesCurrentSchema && Array.isArray(content.timeline)
      ? content.timeline
      : content.timeline?.length ? content.timeline : defaultHomeContent.timeline).map((entry) => ({ ...entry, items: [...entry.items] })),
    timelineImage: content.timelineImage ?? defaultHomeContent.timelineImage,
    solutionItems: (usesCurrentSchema && Array.isArray(content.solutionItems)
      ? content.solutionItems
      : content.solutionItems?.length ? content.solutionItems : defaultSolutionItems).map((item) => ({
      ...item,
      image: migrateSolutionImage(item)
    })),
    newsItems: (hasLegacySolutionItems || (!usesCurrentSchema && storedNews.length === 0) ? defaultLatestUpdates : storedNews).map((item) => ({
      ...item,
      image: b2bMedia(item.image),
      subtitle: item.subtitle ?? item.summary ?? item.action
    })),
    certificateImages: (content.certificateImages ?? []).filter((src) => !legacyCertificateImages.has(src)),
    partners: storedPartners.flatMap((partner) => {
      if (typeof partner === "string") return legacyPartnerLabels.has(partner) ? [] : [{ name: partner }];
      if (!partner || typeof partner !== "object") return [];
      const item = partner as { name?: unknown; logo?: unknown };
      if (typeof item.name !== "string" || legacyPartnerLabels.has(item.name)) return [];
      return [{ name: item.name, ...(typeof item.logo === "string" ? { logo: item.logo } : {}) }];
    }),
    sectionTitles: {
      ...content.sectionTitles,
      solutions: content.sectionTitles?.solutions ?? "全阶段解决方案",
      news: hasLegacySolutionItems ? "最新动态" : content.sectionTitles?.news ?? "最新动态",
      thinkingEyebrow: !content.sectionTitles?.thinkingEyebrow || content.sectionTitles.thinkingEyebrow === "CORE CAPABILITIES"
        ? defaultHomeContent.sectionTitles.thinkingEyebrow
        : content.sectionTitles.thinkingEyebrow,
      thinkingTitle: !content.sectionTitles?.thinkingTitle || ["THINKING", "从核算走向持续碳管理"].includes(content.sectionTitles.thinkingTitle)
        ? defaultHomeContent.sectionTitles.thinkingTitle
        : content.sectionTitles.thinkingTitle
    },
    editorial: {
      path: { ...homeEditorialContent.path, ...storedEditorial?.path },
      headings: {
        drivers: { ...homeEditorialContent.headings.drivers, ...storedEditorial?.headings?.drivers },
        challenges: { ...homeEditorialContent.headings.challenges, ...storedEditorial?.headings?.challenges },
        managementPath: { ...homeEditorialContent.headings.managementPath, ...storedEditorial?.headings?.managementPath },
        services: { ...homeEditorialContent.headings.services, ...storedEditorial?.headings?.services },
        cases: { ...homeEditorialContent.headings.cases, ...storedEditorial?.headings?.cases }
      },
      drivers: usesCurrentSchema && Array.isArray(storedEditorial?.drivers) ? storedEditorial.drivers : storedEditorial?.drivers?.length ? storedEditorial.drivers : homeEditorialContent.drivers,
      challenges: usesCurrentSchema && Array.isArray(storedEditorial?.challenges) ? storedEditorial.challenges : storedEditorial?.challenges?.length ? storedEditorial.challenges : homeEditorialContent.challenges,
      managementPath: usesCurrentSchema && Array.isArray(storedEditorial?.managementPath) ? storedEditorial.managementPath : storedEditorial?.managementPath?.length ? storedEditorial.managementPath : homeEditorialContent.managementPath,
      services: usesCurrentSchema && Array.isArray(storedEditorial?.services) ? storedEditorial.services : storedEditorial?.services?.length ? storedEditorial.services : homeEditorialContent.services,
      cases: usesCurrentSchema && Array.isArray(storedEditorial?.cases) ? storedEditorial.cases : storedEditorial?.cases?.length ? storedEditorial.cases : homeEditorialContent.cases
    }
  };
}

const solutionImages: Record<string, string> = {
  "/solution-standard": "/materials/20260803/资料20260803/解决方案/课程宣传图制作_企业温室气体核算实战（Excel版）_扩展版.svg",
  "/solution-practical": "/media/product-excel-hero.webp",
  "/solution-consulting": "/media/solution-consulting-generated.png",
  "/solution-platform": "/media/reference-diagrams/platform-architecture.svg"
};

const legacySolutionImagePaths = new Set([dataImage, excelImage, platformImage, "/media/solution-training-generated.png", "/media/solution-practical-generated.png", "/media/solution-platform-generated.png"]);

function migrateSolutionImage(item: NewsItem) {
  const image = b2bMedia(item.image);
  return legacySolutionImagePaths.has(image) && solutionImages[item.href]
    ? solutionImages[item.href]
    : image;
}

const defaultSolutionItems: NewsItem[] = [
  { title: "标准版", action: "核算培训", image: solutionImages["/solution-standard"], href: "/solution-standard", summary: "建立温室气体核算基础" },
  { title: "实战营", action: "Excel 单公司版", image: solutionImages["/solution-practical"], href: "/solution-practical", summary: "完成企业首次温室气体核算" },
  { title: "咨询版", action: "Excel 集团版", image: solutionImages["/solution-consulting"], href: "/solution-consulting", summary: "建立集团温室气体核算体系" },
  { title: "平台版", action: "平台管理", image: solutionImages["/solution-platform"], href: "/solution-platform", summary: "建设企业碳数据管理平台" }
];

export const homeEditorialContent: HomeEditorialContent = {
  path: {
    eyebrow: "CAPABILITY PATH",
    title: "从认知建立到数字化运营",
    description: "企业碳管理能力建设路径",
    summary: "企业碳管理能力建设并非一次性项目，而是从方法认知、核算实践、体系建设到数字化运营逐步演进的过程。峰行智成基于企业不同阶段需求，提供全生命周期解决方案。"
  },
  headings: {
    drivers: { eyebrow: "WHY CARBON MANAGEMENT", title: "企业为什么需要碳管理？" },
    challenges: { eyebrow: "CORE CHALLENGES", title: "企业面临的核心挑战", description: "当核算仍依赖分散表格与临时协作，数据很难成为持续管理的基础。" },
    managementPath: { eyebrow: "MANAGEMENT LOGIC", title: "从核算走向碳管理", description: "峰行智成总体思路", summary: "通过统一数据模型与数字化平台，推动企业从“一次性核算”走向“持续运营管理”。" },
    services: { eyebrow: "WHAT WE PROVIDE", title: "我们提供什么" },
    cases: { eyebrow: "CLIENT CASES", title: "客户案例" }
  },
  drivers: [
    { title: "政策监管驱动", description: "碳排放双控制度、全国碳市场扩围和绿色低碳发展要求持续推动企业开展温室气体核算与管理。", icon: "building" },
    { title: "ESG披露驱动", description: "ESG与可持续发展报告逐步从定性披露转向定量核算，温室气体数据成为重要基础数据。", icon: "chart" },
    { title: "供应链驱动", description: "CDP、EcoVadis、CBAM及供应链绿色管理要求不断提高企业碳数据管理水平。", icon: "workflow" }
  ],
  challenges: [
    { title: "数据分散", description: "数据来源多、口径不统一。", icon: "database" },
    { title: "核算复杂", description: "标准多、规则多、人工投入大。", icon: "layers" },
    { title: "结果难追溯", description: "数据来源与计算过程难以复核。", icon: "shield" },
    { title: "价值难释放", description: "核算成果停留在报送层面。", icon: "line" }
  ],
  managementPath: [
    { title: "数据采集", description: "汇集组织、能源与业务活动数据", icon: "database" },
    { title: "数据治理", description: "统一来源、责任与维护口径", icon: "shield" },
    { title: "核算分析", description: "按标准执行核算与多维分析", icon: "chart" },
    { title: "管理决策", description: "支持披露、履约与低碳管理", icon: "line" },
    { title: "数据资产", description: "形成可追溯、可复用的数据基础", icon: "sparkles" }
  ],
  services: [
    { title: "培训赋能", description: "建立温室气体核算能力", href: "/solution-standard", icon: "users" },
    { title: "咨询实施", description: "建立统一核算体系", href: "/solution-consulting", icon: "building" },
    { title: "数字化平台", description: "构建企业碳管理数字化能力", href: "/solution-platform", icon: "database" },
    { title: "持续运营", description: "推动碳数据价值释放", href: "/solution-platform", icon: "workflow" }
  ],
  cases: [
    { title: "培训赋能案例", description: "从方法认知与标准理解开始，培养企业内部核算人才。", href: "/customer-cases#training-case", icon: "users" },
    { title: "Excel单公司版案例", description: "围绕单一法人完成数据梳理、核算与成果交付。", href: "/customer-cases#excel-company-case", icon: "chart" },
    { title: "Excel集团版案例", description: "统一成员企业核算口径，支持集团汇总与披露。", href: "/customer-cases#excel-group-case", icon: "building" },
    { title: "数字化平台案例", description: "建立统一碳数据体系，推动核算与管理持续运行。", href: "/customer-cases#platform-case", icon: "database" }
  ]
};

const defaultLatestUpdates: NewsItem[] = [
  { title: "温室气体核算边界如何确定？", action: "核算方法", subtitle: "从组织边界、运营边界到排放源识别，建立一致的核算口径。", image: "/media/manufacturing-carbon-accounting.png", href: "/knowledge-center", summary: "从组织边界、运营边界到排放源识别，建立一致的核算口径。" },
  { title: "集团企业如何实现碳数据统一汇总？", action: "集团管理", subtitle: "以统一数据结构和核算规则支撑分子公司协同与集团汇总。", image: "/media/manufacturing-carbon-governance.png", href: "/knowledge-center", summary: "以统一数据结构和核算规则支撑分子公司协同与集团汇总。" },
  { title: "从年度填报走向持续碳管理", action: "数字化实践", subtitle: "让数据采集、核算分析与管理决策形成可持续运行的闭环。", image: "/media/manufacturing-carbon-analytics.png", href: "/knowledge-center", summary: "让数据采集、核算分析与管理决策形成可持续运行的闭环。" },
  { title: "企业碳管理如何形成持续运营机制？", action: "管理实践", subtitle: "从数据采集到分析决策，让每一项碳管理工作能够持续沉淀。", image: "/media/manufacturing-carbon-operations.png", href: "/knowledge-center", summary: "从数据采集到分析决策，让每一项碳管理工作能够持续沉淀。" }
];

const defaultNavItems: NavItem[] = [
  { label: "首页", href: "/#home" },
  { label: "解决方案", href: "/#solutions", children: [
    { label: "标准版（培训赋能）", href: "/solution-standard" },
    { label: "实战营（Excel单公司版）", href: "/solution-practical" },
    { label: "咨询版（Excel集团版）", href: "/solution-consulting" },
    { label: "平台版（数字化升级）", href: "/solution-platform" }
  ] },
  { label: "产品中心", href: "/excel-accounting-tool", children: [
    { label: "Excel版温室气体核算工具", href: "/excel-accounting-tool" },
    { label: "企业碳管理数字化平台", href: "/carbon-management-platform" }
  ] },
  { label: "客户案例", href: "/customer-cases" },
  { label: "资源中心", href: "/knowledge-center", children: [
    { label: "双碳专栏", href: "/knowledge-center#double-carbon" },
    { label: "视频课程", href: "/knowledge-center#video-courses" },
    { label: "资料下载", href: "/knowledge-center#downloads" }
  ] },
  { label: "关于我们", href: "/company-profile", children: [
    { label: "公司介绍", href: "/company-profile" },
    { label: "核心能力", href: "/company-profile#service-capability-title" },
    { label: "资质荣誉", href: "/company-honors" },
    { label: "联系我们", href: "/company-contact" }
  ] }
];

function cloneDefaultNavItems(): NavItem[] {
  return defaultNavItems.map((item) => ({
    ...item,
    children: item.children?.map((child) => ({ ...child }))
  }));
}

const subpageLayouts: Record<string, SubpageLayout> = {
  "solution-standard": "training",
  "solution-practical": "practical",
  "solution-consulting": "consulting",
  "solution-platform": "solution-platform",
  "excel-accounting-tool": "excel",
  "carbon-management-platform": "product-platform",
  "customer-cases": "cases",
  "knowledge-center": "knowledge",
  "company-profile": "company",
  "company-honors": "honors",
  "company-partners": "partners",
  "company-contact": "contact",
  "service-capability-path": "service",
  "service-training-consulting": "service",
  "service-platform-delivery": "service"
};

function buildStructuredSections(page: StoredSubpage): SubpageSection[] {
  return [
    {
      id: "metrics",
      kind: "metrics",
      title: "页面指标",
      items: page.metrics.map((metric) => ({ title: metric.label, value: metric.value }))
    },
    {
      id: "capabilities",
      kind: "capabilities",
      title: "核心内容",
      items: page.features.map((feature, index) => ({ title: feature, description: page.steps[index] }))
    },
    {
      id: "process",
      kind: "process",
      title: "实施路径",
      items: page.steps.map((step, index) => ({ title: step, description: page.features[index] }))
    }
  ].filter((section) => section.items.length > 0) as SubpageSection[];
}

function normalizeSubpage(page: StoredSubpage): Subpage {
  const preservesManagedContent = (page.schemaVersion ?? 0) >= 2;
  const storedMedia = Object.fromEntries(
    Object.entries(page.media ?? {}).filter(([, value]) => typeof value === "string" && value.trim().length > 0)
  );
  const media = Object.fromEntries(
    Object.entries(preservesManagedContent ? storedMedia : { ...(defaultPageMedia[page.slug] ?? {}), ...storedMedia })
      .map(([key, value]) => [key, b2bMedia(value)])
  );
  return {
    ...page,
    layout: page.layout ?? subpageLayouts[page.slug] ?? "training",
    sections: (preservesManagedContent && Array.isArray(page.sections)
      ? page.sections
      : page.sections?.length ? page.sections : buildStructuredSections(page)).map((section) => ({
      ...section,
      description: section.description === legacyPlatformIsolationDescription ? platformDemoDescription : section.description,
      items: section.items.map((item) => page.slug === "company-contact" && item.title.includes("邮箱")
        ? { ...item, value: canonicalEmail }
        : { ...item, image: item.image ? derivedDisplayMedia[item.image] ?? item.image : undefined })
    })),
    image: b2bMedia(page.image),
    media
  };
}

function normalizeSubpagesContent(content: StoredSubpage[]): Subpage[] {
  return content.map(normalizeSubpage);
}

export const defaultHomeContent: HomeContent = {
  site: {
    title: "峰行智成｜企业碳管理数字化服务商",
    description: "新疆峰行智成数据科技有限责任公司，提供温室气体核算、碳管理体系建设、Excel 核算工具与企业碳管理数字化服务。"
  },
  brand: {
    name: "峰行智成",
    logo: "/media/fengxing-logo-transparent.png",
    href: "/#home"
  },
  navItems: cloneDefaultNavItems(),
  heroSlides: [
    { eyebrow: "企业碳管理数字化服务商", title: "让碳数据从“算得出”走向“管得好、用得上、可价值化”", description: "专注企业温室气体核算与碳管理数字化建设，帮助企业建立从核算、管理到价值释放的长期能力体系。", image: heroVisual, cta: "了解解决方案", href: "/solution-standard", secondaryCta: "预约产品演示", secondaryHref: "/#contact" }
  ],
  aboutTabs: [
    { value: "about", label: "公司介绍", title: "新疆峰行智成数据科技有限责任公司", kicker: "ABOUT US", body: "专注于为各类组织提供温室气体核算与碳管理数字化解决方案。通过统一数据体系与集中核算引擎，推动温室气体核算由“年度填报”向“持续管理”转变。", image: "/media/about-company-generated.png", imageAlt: "峰行智成团队协作场景" },
    { value: "mission", label: "企业使命", title: "以智慧驱动业务增长", kicker: "MISSION", body: "从培训赋能、咨询实施到数字化平台和持续运营，以标准化方法、可追溯数据与数字工具支撑企业长期碳管理。", image: "/media/about-philosophy-generated.png", imageAlt: "企业碳管理方法与数据模型" },
    { value: "vision", label: "企业愿景", title: "成为企业绿色低碳转型可信赖的长期合作伙伴", kicker: "VISION", body: "帮助企业建立从核算、管理到价值释放的长期能力体系，为监管履约、信息披露、供应链协同与低碳决策提供稳定的数据基础。", image: "/media/about-vision-generated.png", imageAlt: "企业绿色低碳转型愿景" }
  ],
  timeline: [
    { year: "01", items: ["标准版", "培训赋能"] },
    { year: "02", items: ["实战营", "Excel单公司版"] },
    { year: "03", items: ["咨询版", "Excel集团版"] },
    { year: "04", items: ["平台版", "数字化升级"] }
  ],
  timelineImage: "/media/path-carbon-warm.jpg",
  solutionItems: defaultSolutionItems,
  newsItems: defaultLatestUpdates,
  products: [
    { name: "Excel版温室气体核算工具", summary: "提供单公司版与集团版，支持自动汇总、多年度分析和可持续数据积累。", icon: "chart", href: "/excel-accounting-tool" },
    { name: "企业碳管理数字化平台", summary: "统一数据体系、统一核算引擎、统一分析体系和统一管理平台。", icon: "database", href: "/carbon-management-platform" }
  ],
  capabilities: [
    { label: "温室气体核算", icon: "chart" },
    { label: "碳管理咨询", icon: "users" },
    { label: "数据治理", icon: "shield" },
    { label: "自动化核算", icon: "workflow" },
    { label: "管理驾驶舱", icon: "line" },
    { label: "持续运营", icon: "sparkles" }
  ],
  certificateImages: [],
  partners: [],
  sectionTitles: { timeline: "企业碳管理能力建设路径", solutions: "全阶段解决方案", news: "最新动态", products: "产品中心", certificates: "资质荣誉", partners: "合作伙伴", thinkingEyebrow: "OUR POSITIONING", thinkingTitle: "企业碳管理能力建设专家", contact: "联系峰行智成" },
  thinkingText: "以温室气体核算为起点，通过数据采集、数据治理、核算分析、管理决策和持续运营，推动企业沉淀可追溯、可复用的碳数据资产。",
  contact: { title: "联系峰行智成", description: "业务咨询：15099663016｜service@fengxingdata.com", namePlaceholder: "联系人", companyPlaceholder: "企业名称", contactPlaceholder: "请输入手机号或微信号", emailPlaceholder: "联系邮箱", messagePlaceholder: "企业需求", submitLabel: "提交咨询", successLabel: "咨询已提交", errorLabel: "提交失败，请稍后重试。" },
  footer: standardFooter,
  editorial: homeEditorialContent
};

const defaultCustomerCaseSections: SubpageSection[] = [
  {
    id: "case-categories",
    kind: "gallery",
    title: "按能力建设路径展示案例",
    description: "案例统一按照项目背景、面临问题、建设内容、实施过程、建设成果与客户价值组织。",
    items: [
      { title: "培训赋能案例", description: "帮助企业统一标准认知，掌握温室气体核算方法并培养内部人才。", details: { "项目背景": "企业启动温室气体核算工作，需要先统一参与人员对标准、边界和方法的理解。", "面临问题": "内部缺少专业人员，核算口径不一致，难以把标准要求落实到实际业务数据。", "建设内容": "开展核算方法、适用标准、Excel 实操和企业场景案例培训。", "实施过程": "需求访谈、课程设计、集中培训、实操演练、问题复盘。", "建设成果": "形成企业温室气体核算实操课程与后续工作清单。", "客户价值": "建立统一认知，培养内部人才，使团队具备独立开展核算的基础能力。" } },
      { title: "Excel单公司版案例", description: "帮助单一法人企业梳理数据台账，完成首次核算闭环并形成标准成果。", details: { "项目背景": "单一法人企业准备完成首次温室气体核算，并形成可持续更新的数据台账。", "面临问题": "数据来源分散，采集模板缺失，计算过程和成果复核依赖临时人工协作。", "建设内容": "梳理数据来源，部署 Excel 单公司版工具，配置边界、因子和计算规则。", "实施过程": "边界确认、数据采集、工具配置、实操辅导、过程校核、成果交付。", "建设成果": "形成企业温室气体核算报表、活动数据台账与工作底稿。", "客户价值": "完成首次核算闭环，并为核查、披露和后续年度更新建立标准基础。" } },
      { title: "Excel集团版案例", description: "帮助集团统一成员企业核算口径，实现独立核算、自动汇总与集中复核。", details: { "项目背景": "集团需要由成员企业独立维护数据，同时在集团层面统一汇总和复核。", "面临问题": "各公司核算口径、数据模板和责任分工不同，集团汇总效率低且难以追溯。", "建设内容": "统一组织边界、数据模板和核算口径，部署单体核算与集团汇总模型。", "实施过程": "集团规则设计、成员企业部署、填报辅导、集中复核、集团成果汇总。", "建设成果": "形成企业温室气体核算报表（Excel 集团版）及统一工作规范。", "客户价值": "实现子公司独立核算、集团自动汇总，并持续支撑 ESG 披露。" } },
      { title: "数字化平台案例", description: "帮助企业建设统一碳数据体系，实现自动核算、多维分析与持续运营。", details: { "项目背景": "企业已有基础核算体系，希望将分散数据和年度核算工作转入统一平台。", "面临问题": "数据分散存储、人工维护成本高，缺少自动化核算、多维分析和持续沉淀。", "建设内容": "搭建统一数据模型、核算引擎、分析体系与管理平台。", "实施过程": "业务蓝图、平台配置、数据初始化、试运行、用户培训、持续运营支持。", "建设成果": "交付企业碳管理数字化平台及配套数据、规则和运营机制。", "客户价值": "实现数据集中管理、自动化核算、多维分析决策和多场景价值释放。" } }
    ]
  },
  { id: "case-introduction", kind: "capabilities", title: "沿能力建设路径，查看不同阶段的项目实践", description: "案例不使用未经确认的客户名称或量化成效。每类案例采用一致的信息结构，便于企业对照自身阶段判断建设重点。", items: [] },
  { id: "case-structure", kind: "process", title: "每个案例都回答六个关键问题", description: "从项目为何启动，到如何实施、交付什么，以及最终为企业带来什么价值。", items: [
    { title: "项目背景", description: "说明企业所处阶段、业务背景与启动原因。" },
    { title: "面临问题", description: "识别数据、方法、组织协同或管理应用中的关键障碍。" },
    { title: "建设内容", description: "明确本次项目覆盖的服务范围与工作任务。" },
    { title: "实施过程", description: "呈现从准备、实施到交付的推进过程。" },
    { title: "建设成果", description: "说明形成的工具、体系、报告或平台成果。" },
    { title: "客户价值", description: "归纳项目为企业能力建设带来的长期价值。" }
  ] },
  { id: "case-cta", kind: "contacts", title: "从企业当前阶段出发，匹配相近的建设案例", description: "下一步", items: [{ title: "联系顾问", value: "/#contact" }] }
];

type SolutionSectionProfile = {
  suitableFor: string[];
  problems: string[];
  deliverable: string;
  deliverableDescription: string;
  presentationTitle: string;
  presentationDescription: string;
  presentationItems: Array<{ title: string; description: string }>;
  services: string[];
  outcomes: string[];
  outcomeLabel: string;
  diagramTitle: string;
  diagramDescription: string;
  diagramImage: string;
};

function titleItems(items: string[]) {
  return items.map((title) => ({ title }));
}

function solutionSections(profile: SolutionSectionProfile): SubpageSection[] {
  return [
    { id: "solution-fit", kind: "capabilities", title: "适用企业", items: titleItems(profile.suitableFor) },
    { id: "solution-problems", kind: "capabilities", title: "核心解决问题", items: titleItems(profile.problems) },
    { id: "solution-deliverable", kind: "resources", title: "核心交付成果", items: [{ title: profile.deliverable, description: profile.deliverableDescription }] },
    { id: "solution-presentation", kind: "process", title: profile.presentationTitle, description: profile.presentationDescription, items: profile.presentationItems },
    { id: "solution-services", kind: "process", title: "服务内容", items: titleItems(profile.services) },
    { id: "solution-outcomes", kind: "capabilities", title: profile.outcomeLabel, items: titleItems(profile.outcomes) },
    { id: "solution-diagram", kind: "gallery", title: profile.diagramTitle, description: profile.diagramDescription, items: [{ title: profile.diagramTitle, description: profile.diagramDescription, image: profile.diagramImage }] },
    { id: "solution-cta", kind: "contacts", title: "讨论适合企业当前阶段的建设路径", description: "下一步", items: [{ title: "联系顾问", value: "/#contact" }] }
  ];
}

const solutionPageSections: Record<string, SubpageSection[]> = {
  "solution-standard": solutionSections({
    suitableFor: ["初步启动核算工作", "缺少专业人员", "方法认知不足", "需要统一口径"],
    problems: ["核算方法不清晰", "标准理解不统一", "核算边界模糊", "缺乏实战经验"],
    deliverable: "《企业温室气体核算实操课程》",
    deliverableDescription: "帮助企业建立核算认知，掌握国家标准与核算方法，形成可延续的内部工作基础。",
    presentationTitle: "从标准理解到企业实战",
    presentationDescription: "课程围绕核算方法、适用标准和Excel实战展开，让参与人员把知识转化为可执行的内部工作方法。",
    presentationItems: [{ title: "方法认知", description: "温室气体核算基本逻辑与工作边界" }, { title: "标准理解", description: "GHG Protocol、ISO14064与国标要求" }, { title: "工具实战", description: "通过Excel演练掌握数据与计算关系" }, { title: "案例复盘", description: "结合企业案例识别常见问题与处理方式" }],
    services: ["温室气体核算方法培训", "GHG Protocol培训", "ISO14064培训", "国标培训", "Excel实战演练", "企业案例解析"],
    outcomes: ["建立统一认知", "掌握核算方法", "培养内部人才", "具备独立核算能力"],
    outcomeLabel: "客户收益",
    diagramTitle: "企业碳管理能力建设路线图",
    diagramDescription: "从启动准备、培训赋能到实际应用，明确企业建立温室气体核算能力的推进路径。",
    diagramImage: defaultPageMedia["solution-standard"].diagram
  }),
  "solution-practical": solutionSections({
    suitableFor: ["准备开展首次核算", "需要建立数据台账", "希望形成标准成果", "需要支撑核查与披露"],
    problems: ["数据采集缺少统一模板", "核算流程尚未闭环", "过程校核依赖人工", "成果难以持续更新"],
    deliverable: "《企业温室气体核算报表（Excel单公司版）》",
    deliverableDescription: "基于企业实际数据完成一次核算，形成可复用的核算成果、数据台账与工作模板。",
    presentationTitle: "完成首次核算闭环",
    presentationDescription: "以企业真实数据为主线，把数据采集、工具部署、实操辅导、过程校核和成果交付串成连续流程。",
    presentationItems: [{ title: "数据采集梳理", description: "明确数据来源、责任人与填报口径" }, { title: "Excel工具部署", description: "按企业边界配置核算表与数据台账" }, { title: "实操与校核", description: "完成数据维护、排放计算与过程复核" }, { title: "成果交付", description: "形成核算报表、台账与可复用工作模板" }],
    services: ["数据采集梳理", "Excel工具部署", "实操辅导", "过程校核", "成果交付"],
    outcomes: ["完成首次核算", "建立数据台账", "形成标准成果", "支撑核查与披露"],
    outcomeLabel: "客户收益",
    diagramTitle: "企业碳数据治理与标准体系",
    diagramDescription: "将数据标准、核算规则和管理应用纳入统一体系，支撑长期维护和持续分析。",
    diagramImage: defaultPageMedia["solution-practical"].diagram
  }),
  "solution-consulting": solutionSections({
    suitableFor: ["多法人或多层级集团", "成员企业独立核算", "需要集团统一汇总", "需要支撑ESG披露"],
    problems: ["子公司核算口径不一致", "数据模板与责任分散", "集团汇总复核效率低", "年度更新难以协同"],
    deliverable: "《企业温室气体核算报表（Excel集团版）》",
    deliverableDescription: "形成子公司独立核算、集团自动汇总的完整体系架构，为年度更新与披露准备提供统一基础。",
    presentationTitle: "集团统筹，成员企业协同",
    presentationDescription: "由集团统一组织边界、核算口径和汇总规则，成员企业独立维护数据并完成核算，最终形成集团级统一成果。",
    presentationItems: [{ title: "集团规则层", description: "统一组织边界、数据模板与核算口径" }, { title: "成员执行层", description: "子公司独立采集数据并完成单体核算" }, { title: "集中复核层", description: "集团汇总、异常校核与口径复核" }, { title: "披露应用层", description: "支撑集团ESG披露与年度持续更新" }],
    services: ["集团组织边界梳理", "统一核算口径与模板", "单体公司核算模型部署", "集团汇总模型设计", "核算口径规范", "实施方案制定"],
    outcomes: ["子公司独立核算", "集团自动汇总", "统一核算口径", "支撑ESG披露"],
    outcomeLabel: "客户收益",
    diagramTitle: "集团和分子公司实施路径",
    diagramDescription: "呈现集团与分子公司在口径制定、数据报送、汇总复核中的协同关系。",
    diagramImage: defaultPageMedia["solution-consulting"].diagram
  }),
  "solution-platform": solutionSections({
    suitableFor: ["已建立基础核算体系", "多组织数据集中管理", "需要持续分析决策", "计划开展数字化升级"],
    problems: ["数据分散存储", "人工维护成本高", "缺少自动化核算", "数据难以持续沉淀"],
    deliverable: "《企业碳管理数字化平台》",
    deliverableDescription: "构建统一数字化平台，实现碳数据集中管理、自动化核算、分析洞察与持续运营。",
    presentationTitle: "让碳管理进入持续运营",
    presentationDescription: "以统一数据体系和核算引擎为基础，将日常数据维护、自动核算、分析决策与长期运营纳入同一平台。",
    presentationItems: [{ title: "统一数据层", description: "集中管理组织、边界、活动数据与排放因子" }, { title: "自动核算层", description: "通过规则引擎执行多组织、多年度核算" }, { title: "分析决策层", description: "开展总量、强度、趋势与组织维度分析" }, { title: "持续运营层", description: "沉淀数据资产并服务多场景价值释放" }],
    services: ["数据模型架构搭建", "平台系统部署", "自动化数据采集", "自动化核算", "分析洞察与管理模块", "持续运营支持"],
    outcomes: ["数据集中管理", "自动化核算", "多维分析决策", "数据持续沉淀", "多场景价值释放"],
    outcomeLabel: "核心价值",
    diagramTitle: "企业碳管理平台架构图",
    diagramDescription: "以统一数据体系、核算引擎和分析应用为主线，展示企业碳管理平台的技术路线与功能协同关系。",
    diagramImage: defaultPageMedia["solution-platform"].diagram
  })
};

type ServiceSectionProfile = {
  lead: string;
  suitableFor: string[];
  tasks: Array<{ title: string; description: string }>;
  steps: Array<{ title: string; description: string }>;
  deliverables: string[];
};

function serviceSections(profile: ServiceSectionProfile): SubpageSection[] {
  return [
    { id: "service-overview", kind: "capabilities", title: profile.lead, items: titleItems(profile.suitableFor) },
    { id: "service-tasks", kind: "capabilities", title: "围绕企业实际工作组织实施", items: profile.tasks },
    { id: "service-steps", kind: "process", title: "从需求确认到持续运行", items: profile.steps },
    { id: "service-deliverables", kind: "resources", title: "让实施成果能够继续使用和更新", items: titleItems(profile.deliverables) },
    { id: "service-cta", kind: "contacts", title: "讨论适合企业当前阶段的实施方式", description: "下一步", items: [{ title: "联系顾问", value: "/#contact" }] }
  ];
}

const servicePageSections: Record<string, SubpageSection[]> = {
  "service-capability-path": serviceSections({
    lead: "先识别企业当前能力阶段，再配置适合的工具、方法与运营机制。",
    suitableFor: ["首次启动碳核算", "已有核算但口径不统一", "需要集团协同管理", "准备进行数字化升级"],
    tasks: [{ title: "核算基础", description: "明确组织边界、排放源、活动数据和适用标准。" }, { title: "数据治理", description: "统一数据来源、责任分工、填报口径与校核规则。" }, { title: "管理应用", description: "把核算成果用于披露、分析、履约和低碳决策。" }, { title: "持续运营", description: "建立年度更新、过程复核和数据持续沉淀机制。" }],
    steps: [{ title: "阶段诊断", description: "判断企业处于认知、实操、体系建设或平台运营阶段。" }, { title: "路径设计", description: "确定培训、Excel 工具、咨询实施与平台建设的组合。" }, { title: "能力落地", description: "围绕真实业务数据完成方法、工具与组织协同建设。" }, { title: "持续升级", description: "从一次性核算逐步走向可复核、可分析、可运营。" }],
    deliverables: ["企业碳管理能力诊断", "分阶段建设路线图", "核算与数据工作机制", "持续运营建议"]
  }),
  "service-training-consulting": serviceSections({
    lead: "以企业真实核算任务为载体，让方法培训、数据梳理与过程复核形成一个闭环。",
    suitableFor: ["缺少内部核算人员", "首次开展温室气体核算", "集团需要统一核算口径", "核算成果需要支撑披露"],
    tasks: [{ title: "标准培训", description: "讲解 GHG Protocol、ISO14064 与国标要求。" }, { title: "边界梳理", description: "结合组织结构和业务活动识别核算范围。" }, { title: "数据辅导", description: "明确数据来源、填报责任与过程校核方法。" }, { title: "成果复核", description: "检查计算逻辑、因子应用与成果完整性。" }],
    steps: [{ title: "需求确认", description: "确定核算场景、参与团队、成果用途和实施范围。" }, { title: "培训赋能", description: "统一方法认知，并结合企业案例开展实操演练。" }, { title: "咨询实施", description: "协同完成数据采集、模型配置、核算与过程校核。" }, { title: "成果移交", description: "交付核算成果、工作底稿和后续更新清单。" }],
    deliverables: ["核算方法培训课程", "企业数据采集清单", "核算报表与工作底稿", "内部核算工作指引"]
  }),
  "service-platform-delivery": serviceSections({
    lead: "围绕企业组织、数据和核算规则实施平台，让系统真正进入日常管理流程。",
    suitableFor: ["多组织数据集中管理", "人工核算维护成本较高", "需要多维分析与追溯", "希望形成长期数字化能力"],
    tasks: [{ title: "数据模型", description: "统一组织、排放源、活动数据与排放因子结构。" }, { title: "核算引擎", description: "配置标准、计算规则、口径和多年度核算逻辑。" }, { title: "业务协同", description: "建立填报、审核、汇总与异常处理流程。" }, { title: "分析应用", description: "配置总量、强度、趋势和组织对标等管理视图。" }],
    steps: [{ title: "业务蓝图", description: "梳理组织范围、业务流程、角色权限与管理目标。" }, { title: "平台配置", description: "搭建数据模型、因子库、核算规则与分析口径。" }, { title: "数据上线", description: "完成初始化、业务验证、用户培训与试运行。" }, { title: "运营支持", description: "支持年度更新、规则维护、问题处理与持续优化。" }],
    deliverables: ["企业碳数据模型", "平台配置与部署成果", "用户操作与管理规范", "持续运营支持机制"]
  })
};

const productResourceSection: SubpageSection = {
  id: "product-resources",
  kind: "resources",
  title: "产品资料下载",
  description: "产品手册、功能清单与部署说明由后台独立维护。",
  items: [{ title: "产品手册", description: "产品介绍与使用说明" }, { title: "功能与版本清单", description: "功能范围与版本说明" }, { title: "部署及试用说明", description: "部署要求与试用指引" }]
};

const excelProductSections: SubpageSection[] = [
  {
    id: "product-editions",
    kind: "capabilities",
    title: "匹配不同组织规模的核算方式",
    description: "从单一法人独立核算，到多层级组织统一汇总，保持核算逻辑和数据口径一致。",
    items: [
      { title: "单公司版", description: "面向单一法人或独立核算主体，完成边界配置、活动数据维护与核算结果输出。", details: { "要点": "独立建立核算台账\n持续积累多年数据" } },
      { title: "集团版", description: "面向多法人、多层级组织，支持分子公司独立维护、集团自动汇总与统一复核。", details: { "要点": "组织数据分级维护\n集团结果自动汇总" } }
    ]
  },
  {
    id: "product-diagram",
    kind: "gallery",
    title: "Excel 工具的数据维护与核算关系",
    description: "说明活动数据、排放因子、计算规则和核算结果在工具中的对应关系。",
    items: [{ title: "Excel 工具的数据维护与核算关系", description: "说明活动数据、排放因子、计算规则和核算结果在工具中的对应关系。", image: defaultPageMedia["excel-accounting-tool"].diagram }]
  },
  { id: "product-screenshots", kind: "gallery", title: "查看两个版本的完整产品界面", description: "切换单公司版与集团版，点击大图可在新窗口查看原始分辨率。", items: [] },
  { id: "product-features", kind: "capabilities", title: "产品特点", description: "把核算方法落实到可持续使用的工具中，兼顾单体核算、集团汇总与多年数据积累。", items: [] },
  productResourceSection,
  { id: "product-cta", kind: "contacts", title: "了解Excel版温室气体核算工具如何适配企业真实的核算与管理流程", description: "从组织边界、数据口径到核算应用，获得与当前能力阶段匹配的产品建议。", items: [{ title: "预约产品演示", value: "/#contact" }] }
];

const platformProductSections: SubpageSection[] = [
  {
    id: "platform-foundation",
    kind: "capabilities",
    title: "统一的碳管理底座",
    description: "数据、核算、分析和管理应用共用同一套口径，减少重复维护。",
    items: titleItems(["统一数据体系", "统一核算引擎", "统一分析体系", "统一管理平台"])
  },
  {
    id: "platform-overview",
    kind: "gallery",
    title: "平台三项核心优势",
    description: "选择一项能力查看对应说明和真实界面。",
    items: [
      { title: "业务数据驱动", description: "企业无需反复填写核算报表，仅需维护业务明细数据，系统自动完成数据归集、因子匹配、排放计算与结果分析。", image: "/media/platform-advantages/business-data-flow.png", details: { "要点": "数据归集\n因子匹配\n排放计算\n结果分析" } },
      { title: "一次核算，多场景复用", description: "平台基于统一碳数据模型，实现同源数据统一治理，让一次核算结果持续服务履约、披露、供应链和经营决策。", image: "/media/platform-advantages/reuse-standard-output.png", details: { "要点": "全国碳市场履约\nESG信息披露\n供应链碳管理\n企业经营分析" } },
      { title: "全流程可信可追溯", description: "平台建立覆盖排放源、活动数据、排放因子与核算结果的全链路管理体系，支持监管报送、第三方核查、ESG披露与内部审计。", image: "/media/platform-advantages/traceability-module-map.png", details: { "要点": "排放源到活动数据\n活动数据到排放因子\n排放因子到核算结果\n结果回溯业务数据与计算逻辑" } }
    ]
  },
  { id: "product-screenshots", kind: "gallery", title: "从数据维护到多维分析的真实界面", description: "11 张平台截图按实际使用顺序呈现；点击主图可查看原始 4K 分辨率。", items: [] },
  { id: "product-video", kind: "gallery", title: "约 4 分钟了解平台工作方式", description: "通过真实操作画面了解数据维护、核算分析与管理应用。", items: [] },
  { id: "product-public-demo", kind: "resources", title: "查看公开数据报告或进入企业端演示", description: platformDemoDescription, items: [{ title: "查看公开数据报告" }, { title: "进入企业端平台" }, { title: "申请试用账号" }] },
  productResourceSection,
  { id: "product-cta", kind: "contacts", title: "了解企业碳管理数字化平台如何适配企业真实的核算与管理流程", description: "从组织边界、数据口径到核算应用，获得与当前能力阶段匹配的产品建议。", items: [{ title: "预约产品演示", value: "/#contact" }] }
];

export const defaultSubpages: Subpage[] = normalizeSubpagesContent([
  { slug: "solution-standard", navLabel: "标准版（培训赋能）", eyebrow: "SOLUTION 01", title: "标准版（培训赋能）", summary: "帮助企业快速掌握温室气体核算方法。", image: solutionImages["/solution-standard"], icon: "users", metrics: [{ label: "服务形式", value: "专项培训" }, { label: "培训重点", value: "核算方法" }, { label: "适用阶段", value: "启动准备" }], features: ["GHG Protocol 核算方法", "ISO 14064-1 核算要求", "GB/T 32150 核算规范", "企业场景实操演练"], steps: ["明确培训范围与参与人员", "梳理核算对象与数据来源", "结合企业场景进行演练", "形成后续核算工作清单"], sections: solutionPageSections["solution-standard"] },
  { slug: "solution-practical", navLabel: "实战营（Excel单公司版）", eyebrow: "SOLUTION 02", title: "实战营（Excel单公司版）", summary: "帮助企业完成首次核算闭环。", image: solutionImages["/solution-practical"], icon: "chart", metrics: [{ label: "适用组织", value: "单一法人" }, { label: "交付工具", value: "Excel 模板" }, { label: "交付成果", value: "核算报告" }], features: ["活动数据台账梳理", "Excel 单公司版配置", "历史年度数据整理", "范围一、范围二及适用范围三核算"], steps: ["梳理核算边界", "收集并复核活动数据", "配置排放因子与计算规则", "交付核算报告和工作底稿"], sections: solutionPageSections["solution-practical"] },
  { slug: "solution-consulting", navLabel: "咨询版（Excel集团版）", eyebrow: "SOLUTION 03", title: "咨询版（Excel集团版）", summary: "建立集团统一核算管理体系。", image: solutionImages["/solution-consulting"], icon: "building", metrics: [{ label: "适用组织", value: "集团企业" }, { label: "管理方式", value: "统一口径" }, { label: "汇总方式", value: "集中复核" }], features: ["成员企业独立核算", "集团数据汇总", "统一数据模板与核算口径", "披露与供应链数据准备"], steps: ["梳理集团组织边界", "制定统一核算规则", "部署成员企业核算工具", "汇总复核并安排年度更新"], sections: solutionPageSections["solution-consulting"] },
  { slug: "solution-platform", navLabel: "平台版（数字化升级）", eyebrow: "SOLUTION 04", title: "平台版（数字化升级）", summary: "建设企业长期碳管理能力。", image: solutionImages["/solution-platform"], icon: "sparkles", metrics: [{ label: "数据范围", value: "统一管理" }, { label: "组织范围", value: "多层级" }, { label: "使用方式", value: "持续维护" }], features: ["多标准温室气体核算", "核算数据与结果统一管理", "基准年和排放趋势分析", "数据来源与计算过程可追溯"], steps: ["梳理业务需求和管理范围", "确认核算边界与数据标准", "建立数据模型和因子规则", "上线运行并安排日常维护"], sections: solutionPageSections["solution-platform"] },
  { slug: "excel-accounting-tool", navLabel: "Excel版温室气体核算工具", eyebrow: "PRODUCT", title: "Excel版温室气体核算工具", summary: "帮助企业快速建立温室气体核算能力。", image: excelImage, icon: "chart", metrics: [{ label: "产品版本", value: "2类" }, { label: "年度分析", value: "支持" }, { label: "集团汇总", value: "自动" }], features: ["单公司版", "集团版", "自动汇总", "多年度分析", "可持续积累"], steps: ["选择组织版本", "配置核算边界", "维护活动数据", "生成核算与分析结果"], product: { screenshots: [{ src: "/materials/20260803/资料20260803/产品/单公司版产品截图-01.svg", label: "单公司版", alt: "Excel温室气体核算工具单公司版完整界面", width: 981, height: 499 }, { src: "/materials/20260803/资料20260803/产品/集团版版产品截图-01.svg", label: "集团版", alt: "Excel温室气体核算工具集团版完整界面", width: 887, height: 703 }] }, sections: excelProductSections },
  { slug: "carbon-management-platform", navLabel: "企业碳管理数字化平台", eyebrow: "PRODUCT", title: "企业碳管理数字化平台", summary: "构建企业统一碳数据体系。", image: "/media/product-platform-hero.webp", icon: "database", metrics: [{ label: "数据体系", value: "统一" }, { label: "核算引擎", value: "统一" }, { label: "管理平台", value: "统一" }], features: ["统一数据体系", "统一核算引擎", "统一分析体系", "统一管理平台"], steps: ["建立统一数据模型", "配置标准与排放因子", "接入并维护活动数据", "自动核算、分析与管理决策"], product: { videoUrl: "/materials/20260803/资料20260803/产品/企业碳管理数字化平台简介.mp4", videoPoster: "/materials/20260803/资料20260803/产品/平台截图/2.png", enterpriseUrl: "/sample/", trialUrl: "/#contact", publicReportUrl: "https://app.powerbi.com/view?r=eyJrIjoiYjQzODVjYmEtYzFiMy00NDQ0LWIwZTAtMjM2YmVjOWNlZDAyIiwidCI6ImU2NDExZmRiLTZkNzctNGZmZC1iMDE1LTYxOWM3NWIxMzc2OCIsImMiOjEwfQ%3D%3D", screenshots: [
    ...Array.from({ length: 7 }, (_, index) => ({ src: `/materials/20260803/资料20260803/产品/平台截图/${index + 1}.png`, alt: `企业碳管理数字化平台界面截图${index + 1}`, label: ["数据维护", "分析首页", "分析目录", "排放总览", "多标准排放总表", "基准年对比", "强度分析"][index], width: 3840, height: 2040 })),
    { src: "/materials/20260813/platform-ghg-protocol-view.png", alt: "企业碳管理数字化平台 GHG Protocol 核算视图", label: "GHG Protocol 视图", width: 3840, height: 2040 },
    { src: "/materials/20260813/platform-iso-14064-view.png", alt: "企业碳管理数字化平台 ISO 14064-1 核算视图", label: "ISO 14064-1 视图", width: 3840, height: 2040 },
    { src: "/materials/20260813/platform-gbt-32150-view.png", alt: "企业碳管理数字化平台 GB/T 32150-2025 核算视图", label: "GB/T 32150-2025 视图", width: 3840, height: 2040 },
    { src: "/materials/20260813/platform-greenhouse-gas-analysis.png", alt: "企业碳管理数字化平台温室气体构成分析视图", label: "温室气体构成分析", width: 3840, height: 2040 }
  ] }, sections: platformProductSections },
  { slug: "customer-cases", layout: "cases", navLabel: "客户案例", eyebrow: "CLIENT CASES", title: "客户案例", summary: "围绕企业碳管理能力建设的不同阶段，按培训赋能、Excel单公司版、Excel集团版和数字化平台四类展示项目案例。", image: dataImage, icon: "building", metrics: [{ label: "案例分类", value: "4类" }, { label: "统一结构", value: "6项" }], features: ["培训赋能案例", "Excel单公司版案例", "Excel集团版案例", "数字化平台案例"], steps: ["项目背景", "面临问题", "建设内容", "实施过程", "建设成果", "客户价值"], sections: defaultCustomerCaseSections },
  { slug: "knowledge-center", navLabel: "资源中心", eyebrow: "RESOURCE CENTER", title: "企业碳管理资源中心", summary: "围绕企业碳管理所需的政策、方法、工具与实践，提供双碳专栏、视频课程和资料下载。", image: dataImage, icon: "sparkles", metrics: [{ label: "内容栏目", value: "3类" }, { label: "课程方向", value: "5类" }, { label: "服务对象", value: "企业" }], features: ["双碳政策解读", "温室气体核算", "ESG管理", "CDP问卷", "CBAM", "碳市场动态"], steps: ["企业碳核算入门", "Excel核算实战", "集团核算体系建设", "数字化平台培训", "ESG基础课程"], sections: [
    { id: "video-courses", kind: "process", title: "循序进入企业碳管理", description: "从入门方法到工具实战、集团体系与平台应用，逐步建立企业内部能力。", items: [] },
    { id: "online-classroom", kind: "resources", title: "在线课堂", description: "查看直播与在线课程内容。", items: [{ title: "进入在线课堂", description: "千聊课堂", value: "https://h5.qlchat.com/wechat/page/live/320000078097038?liveId=320000078097038" }] },
    { id: "downloads", kind: "resources", title: "课程、工具与方案资料", description: "获取产品手册、解决方案与Excel核算工具的当前有效版本。", items: [{ title: "产品手册" }, { title: "解决方案" }, { title: "Excel核算工具" }] },
    { id: "knowledge-cta", kind: "contacts", title: "为团队规划一条可执行的学习路径", description: "下一步", items: [{ title: "联系顾问", value: "/#contact" }] }
  ] },
  { slug: "company-profile", navLabel: "公司介绍", eyebrow: "ABOUT", title: "新疆峰行智成数据科技有限责任公司", summary: "企业碳管理数字化服务商", image: platformImage, icon: "users", metrics: [{ label: "企业定位", value: "企业碳管理数字化服务商" }, { label: "企业使命", value: "以智慧驱动业务增长" }, { label: "企业愿景", value: "成为企业绿色低碳转型可信赖的长期合作伙伴" }], features: ["温室气体核算", "碳管理咨询", "数字化平台", "实施运营"], steps: [], sections: [
    { id: "company-beliefs", kind: "metrics", title: "企业定位、使命与愿景", description: "COMPANY PROFILE", items: [] },
    { id: "company-introduction", kind: "capabilities", title: "企业简介", description: "ABOUT FENGXING", items: [{ title: "企业简介", description: "新疆峰行智成数据科技有限责任公司，专注于为各类组织提供温室气体核算与碳管理数字化解决方案。针对企业在多标准、多场景下的核算需求，公司构建了以统一数据体系和集中核算引擎为核心的数字化平台，实现一次数据维护、多口径核算与多维分析，推动温室气体核算由“年度填报”向“持续管理”转变，为企业应对监管履约、信息披露及低碳管理提供长期、稳定、可追溯的数据基础。" }] },
    { id: "core-capabilities", kind: "capabilities", title: "核心能力", description: "从基础核算到长期运营", items: [
      { title: "温室气体核算", description: "GHG Protocol、ISO14064、GB/T32150" },
      { title: "碳管理咨询", description: "碳管理体系建设、ESG支撑、CDP支撑" },
      { title: "数字化平台", description: "数据治理、自动化核算、管理驾驶舱" },
      { title: "实施运营", description: "培训赋能、咨询实施、平台建设、持续运营" }
    ] },
    { id: "company-cta", kind: "contacts", title: "与峰行智成讨论企业碳管理建设", description: "下一步", items: [{ title: "联系顾问", value: "/#contact" }] }
  ] },
  { slug: "company-honors", layout: "honors", navLabel: "资质荣誉", eyebrow: "HONORS", title: "资质荣誉", summary: "专业能力与成果持续沉淀", image: heroPlatform, icon: "shield", metrics: [], features: [], steps: [], sections: [{ id: "honors", kind: "gallery", title: "资质荣誉", items: [{ title: "软件著作权" }, { title: "大赛荣誉" }, { title: "行业认证" }] }] },
  { slug: "company-partners", layout: "partners", navLabel: "合作伙伴", eyebrow: "PARTNERS", title: "合作伙伴", summary: "与客户及生态伙伴的合作，以项目实际需求和双方确认的信息为基础。", image: heroVisual, icon: "users", metrics: [], features: [], steps: [], sections: [{ id: "partners", kind: "gallery", title: "合作伙伴", description: "感谢每一位与峰行智成共同推进企业碳管理建设的伙伴。", items: [] }] },
  { slug: "company-contact", layout: "contact", navLabel: "联系我们", eyebrow: "CONTACT", title: "联系我们", summary: "围绕温室气体核算、碳管理咨询和数字化建设，欢迎与我们沟通您的业务需求。", image: heroVisual, icon: "users", metrics: [], features: [], steps: [], sections: [{ id: "contact", kind: "contacts", title: "联系方式", description: "可通过电话、邮箱或页面右下角企业微信与我们联系。", items: [{ title: "联系电话", value: "15099663016", description: "工作日可通过电话联系" }, { title: "联系邮箱", value: "service@fengxingdata.com", description: "可发送项目资料或合作需求" }, { title: "企业微信", description: "扫描页面右下角二维码添加企业顾问" }, { title: "微信公众号", description: "内容持续更新中" }, { title: "公司地址", description: "项目沟通时提供" }] }] },
  { slug: "service-capability-path", layout: "service", navLabel: "能力建设路径", eyebrow: "IMPLEMENTATION", title: "能力建设路径", summary: "从核算基础、数据治理到持续运营，结合企业实际阶段建立可持续使用的碳管理能力。", image: "/media/service-capability-path-hero.png", icon: "workflow", metrics: [], features: [], steps: [], sections: [...servicePageSections["service-capability-path"], { id: "capability-visual", kind: "gallery", title: "能力建设", items: [{ title: "面向多层级组织的温室气体核算三层实施架构", description: "按照成员企业与集团的组织层级和管理成熟度，分别配置数字化平台、Excel 单公司版与 Excel 集团版，统一核算口径并支持集团汇总。", image: "/media/reference-diagrams/three-layer-implementation.svg" }] }] },
  { slug: "service-training-consulting", layout: "service", navLabel: "培训与咨询实施", eyebrow: "IMPLEMENTATION", title: "培训与咨询实施", summary: "围绕企业温室气体核算与碳管理需求，提供培训、数据梳理、方法辅导和过程复核支持。", image: "/media/service-training-consulting-hero.png", icon: "users", metrics: [], features: [], steps: [], sections: [...servicePageSections["service-training-consulting"], { id: "training-visual", kind: "gallery", title: "实施流程", items: [{ title: "温室气体核算服务流程", description: "以统一方法、业务数据和过程复核为基础，将培训与咨询内容转化为企业可以延续使用的核算工作流程。", image: "/media/reference-diagrams/service-process.svg" }] }] },
  { slug: "service-platform-delivery", layout: "service", navLabel: "数字化平台实施", eyebrow: "IMPLEMENTATION", title: "数字化平台实施", summary: "以统一数据体系和核算规则为基础，实施企业碳管理数字化平台，支持长期维护与持续分析。", image: "/media/service-platform-delivery-hero.png", icon: "database", metrics: [], features: [], steps: [], sections: [...servicePageSections["service-platform-delivery"], { id: "platform-visual", kind: "gallery", title: "平台建设", items: [{ title: "企业碳管理平台功能架构", description: "以数据模型、核算规则和分析应用为主线，支持多组织、多年度的持续维护与管理使用。", image: "/media/reference-diagrams/platform-function-architecture.svg" }] }] }
]);

export function normalizeStoredSubpages(content: StoredSubpage[]): Subpage[] {
  const stored = normalizeSubpagesContent(content).map((page) => {
    const fallback = defaultSubpages.find((entry) => entry.slug === page.slug);
    const migrated = migrateStoredSubpage(page, fallback, subpageContentSchemaVersion);
    const solutionImage = solutionImages[`/${migrated.slug}`];
    const isLegacySolutionImage = legacySolutionImagePaths.has(migrated.image);
    const withSolutionImage = solutionImage && isLegacySolutionImage ? { ...migrated, image: solutionImage } : migrated;
    const diagramUpdates = solutionDiagramMigrations.filter((update) => update.slug === withSolutionImage.slug);
    const withDiagramUpdates = diagramUpdates.reduce(
      (current, update) => migrateSolutionDiagramBinding(current, update),
      withSolutionImage
    );
    const withProductUpdates = withDiagramUpdates.slug === "excel-accounting-tool"
      ? {
          ...withDiagramUpdates,
          media: withDiagramUpdates.media?.diagram === "/media/reference-diagrams/data-modeling-flow.svg" ? { ...withDiagramUpdates.media, diagram: "/media/reference-diagrams/excel-standard-flow.svg" } : withDiagramUpdates.media,
          sections: withDiagramUpdates.sections.map((section) => section.id === "product-diagram" ? { ...section, items: section.items.map((item) => item.image === "/media/reference-diagrams/data-modeling-flow.svg" ? { ...item, image: "/media/reference-diagrams/excel-standard-flow.svg" } : item) } : section)
        }
      : withDiagramUpdates.slug === "carbon-management-platform"
        ? {
            ...withDiagramUpdates,
            product: withDiagramUpdates.product ? {
              ...withDiagramUpdates.product,
              screenshots: [
                ...(withDiagramUpdates.product.screenshots ?? []),
                ...((fallback?.product?.screenshots ?? []).filter((screenshot) => screenshot.src.startsWith("/materials/20260813/") && !(withDiagramUpdates.product?.screenshots ?? []).some((stored) => stored.src === screenshot.src)))
              ]
            } : fallback?.product,
            sections: withDiagramUpdates.sections.map((section) => section.id === "platform-overview" && section.title === "三项能力，贯穿企业碳数据全流程"
              ? { ...section, title: "平台三项核心优势" }
              : section.id === "product-screenshots" && section.description?.startsWith("7 张平台截图")
                ? { ...section, description: "11 张平台截图按实际使用顺序呈现；点击主图可查看原始 4K 分辨率。" }
                : section)
          }
        : withDiagramUpdates;
    const withPlatformImage = withProductUpdates.slug === "carbon-management-platform" && withProductUpdates.image === platformImage
      ? { ...withProductUpdates, image: "/media/product-platform-hero.webp" }
      : withProductUpdates;
    if (withPlatformImage.slug !== "knowledge-center") return withPlatformImage;
    const usesLegacyNavLabel = withPlatformImage.navLabel === "知识课堂" || withPlatformImage.navLabel === "资料中心";
    const usesLegacyTitle = withPlatformImage.title === "企业碳管理知识课堂" || withPlatformImage.title === "企业碳管理资料中心";
    return {
      ...withPlatformImage,
      ...(usesLegacyNavLabel ? { navLabel: "资源中心" } : {}),
      ...(usesLegacyTitle ? { title: "企业碳管理资源中心" } : {}),
      eyebrow: "RESOURCE CENTER",
    };
  });
  const preservesManagedPages = stored.some((page) => (page.schemaVersion ?? 0) >= 2);
  const storedSlugs = new Set(stored.map((page) => page.slug));
  return preservesManagedPages ? stored : [...stored, ...defaultSubpages.filter((page) => !storedSlugs.has(page.slug))];
}

export type ContentVersions = { home: number; subpages: number; knowledge: number };
export type SiteContentBundle = { home: HomeContent; subpages: Subpage[]; knowledge: KnowledgeEntry[]; versions: ContentVersions };

export class ContentConflictError extends Error {
  constructor() {
    super("Content was modified by another administrator");
    this.name = "ContentConflictError";
  }
}

function parseConfig<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function getHomeContent(): Promise<HomeContent> {
  if (isProductionBuild) return defaultHomeContent;
  try {
    const record = await prisma.siteContent.findUnique({ where: { key: "home" } });
    return normalizeHomeContent(record ? parseConfig(record.value, defaultHomeContent) : defaultHomeContent);
  } catch {
    return defaultHomeContent;
  }
}

async function loadSubpages(): Promise<Subpage[]> {
  if (isProductionBuild) return defaultSubpages;
  try {
    const record = await prisma.siteContent.findUnique({ where: { key: "subpages" } });
    return record ? normalizeStoredSubpages(parseConfig(record.value, defaultSubpages)) : defaultSubpages;
  } catch {
    return defaultSubpages;
  }
}

export function getSubpagesContent(): Promise<Subpage[]> {
  return loadSubpages();
}

function normalizeKnowledgeEntries(entries: unknown): KnowledgeEntry[] {
  const storedBundle = entries && typeof entries === "object" && !Array.isArray(entries)
    ? entries as { schemaVersion?: unknown; entries?: unknown }
    : undefined;
  const usesCurrentSchema = storedBundle?.schemaVersion === knowledgeContentSchemaVersion;
  const source = usesCurrentSchema ? storedBundle?.entries : entries;
  if (!Array.isArray(source)) return defaultKnowledgeEntries;
  const valid = source.filter((entry): entry is KnowledgeEntry => Boolean(entry && typeof entry === "object" &&
    isContentSlug((entry as KnowledgeEntry).slug) &&
    ((entry as KnowledgeEntry).type === "article" || (entry as KnowledgeEntry).type === "course") &&
    typeof (entry as KnowledgeEntry).category === "string" && typeof (entry as KnowledgeEntry).title === "string" &&
    typeof (entry as KnowledgeEntry).summary === "string" && typeof (entry as KnowledgeEntry).meta === "string" &&
    Array.isArray((entry as KnowledgeEntry).sections))).map(normalizeKnowledgeEntry);
  if (usesCurrentSchema) return valid;

  const legacyPolicySlugs = new Set([
    "energy-saving-carbon-reduction-2024-2025",
    "carbon-market-regulation-enterprise-compliance",
    "carbon-emission-dual-control-system"
  ]);
  const articles = valid.filter((entry) => entry.type === "article");
  if (articles.length === legacyPolicySlugs.size && articles.every((entry) => legacyPolicySlugs.has(entry.slug))) {
    return defaultKnowledgeEntries;
  }
  const migrated = valid.length ? valid.map((entry) => {
    if (entry.type !== "course") return entry;
    const fallback = defaultKnowledgeEntries.find((item) => item.type === "course" && item.slug === entry.slug);
    if (!fallback) return entry;
    return {
      ...entry,
      ...(fallback.videoHref && entry.videoHref === undefined ? { videoHref: fallback.videoHref } : {}),
      ...(fallback.coverImage && entry.coverImage === undefined ? { coverImage: fallback.coverImage } : {}),
      ...(fallback.externalHref && entry.externalHref === undefined ? { externalHref: fallback.externalHref } : {}),
      ...(fallback.externalLabel && entry.externalLabel === undefined ? { externalLabel: fallback.externalLabel } : {}),
    };
  }) : defaultKnowledgeEntries;
  const slugs = new Set(migrated.map((entry) => entry.slug));
  return [...migrated, ...defaultKnowledgeEntries.filter((entry) => !slugs.has(entry.slug))];
}

export async function getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  if (isProductionBuild) return defaultKnowledgeEntries;
  try {
    const record = await prisma.siteContent.findUnique({ where: { key: "knowledge" } });
    return record ? normalizeKnowledgeEntries(parseConfig(record.value, defaultKnowledgeEntries)) : defaultKnowledgeEntries;
  } catch {
    return defaultKnowledgeEntries;
  }
}

export async function getKnowledgeEntry(slug: string): Promise<KnowledgeEntry | null> {
  return (await getKnowledgeEntries()).find((entry) => entry.slug === slug) ?? null;
}

export async function getSubpageContent(slug: string): Promise<Subpage | null> {
  const subpages = await loadSubpages();
  return subpages.find((page) => page.slug === slug) ?? null;
}

export async function getSiteContentBundle(): Promise<SiteContentBundle> {
  if (isProductionBuild) return { home: defaultHomeContent, subpages: defaultSubpages, knowledge: defaultKnowledgeEntries, versions: { home: 0, subpages: 0, knowledge: 0 } };
  try {
    const records = await prisma.siteContent.findMany({ where: { key: { in: ["home", "subpages", "knowledge"] } } });
    const homeRecord = records.find((record) => record.key === "home");
    const subpagesRecord = records.find((record) => record.key === "subpages");
    const knowledgeRecord = records.find((record) => record.key === "knowledge");
    return {
      home: normalizeHomeContent(homeRecord ? parseConfig(homeRecord.value, defaultHomeContent) : defaultHomeContent),
      subpages: subpagesRecord ? normalizeStoredSubpages(parseConfig(subpagesRecord.value, defaultSubpages)) : defaultSubpages,
      knowledge: knowledgeRecord ? normalizeKnowledgeEntries(parseConfig(knowledgeRecord.value, defaultKnowledgeEntries)) : defaultKnowledgeEntries,
      versions: { home: homeRecord?.version ?? 0, subpages: subpagesRecord?.version ?? 0, knowledge: knowledgeRecord?.version ?? 0 }
    };
  } catch {
    return { home: defaultHomeContent, subpages: defaultSubpages, knowledge: defaultKnowledgeEntries, versions: { home: 0, subpages: 0, knowledge: 0 } };
  }
}

export async function saveSiteContentBundle(
  bundle: Pick<SiteContentBundle, "home" | "subpages" | "knowledge">,
  expectedVersions: ContentVersions
): Promise<ContentVersions> {
  return prisma.$transaction(async (tx) => {
    const records = await tx.siteContent.findMany({ where: { key: { in: ["home", "subpages", "knowledge"] } } });
    const homeRecord = records.find((record) => record.key === "home");
    const subpagesRecord = records.find((record) => record.key === "subpages");
    const knowledgeRecord = records.find((record) => record.key === "knowledge");
    const current = { home: homeRecord?.version ?? 0, subpages: subpagesRecord?.version ?? 0, knowledge: knowledgeRecord?.version ?? 0 };

  if (current.home !== expectedVersions.home || current.subpages !== expectedVersions.subpages || current.knowledge !== expectedVersions.knowledge) {
      throw new ContentConflictError();
    }

    const storedHome = { ...bundle.home, schemaVersion: contentSchemaVersion };
    const storedSubpages = bundle.subpages.map((page) => ({ ...page, schemaVersion: subpageContentSchemaVersion }));
    const storedKnowledge = { schemaVersion: knowledgeContentSchemaVersion, entries: bundle.knowledge };
    const home = await tx.siteContent.upsert({
      where: { key: "home" },
      update: { value: JSON.stringify(storedHome, null, 2), version: { increment: 1 } },
      create: { key: "home", value: JSON.stringify(storedHome, null, 2), version: 1 }
    });
    const subpages = await tx.siteContent.upsert({
      where: { key: "subpages" },
      update: { value: JSON.stringify(storedSubpages, null, 2), version: { increment: 1 } },
      create: { key: "subpages", value: JSON.stringify(storedSubpages, null, 2), version: 1 }
    });
    const knowledge = await tx.siteContent.upsert({
      where: { key: "knowledge" },
      update: { value: JSON.stringify(storedKnowledge, null, 2), version: { increment: 1 } },
      create: { key: "knowledge", value: JSON.stringify(storedKnowledge, null, 2), version: 1 }
    });

    return { home: home.version, subpages: subpages.version, knowledge: knowledge.version };
  });
}
