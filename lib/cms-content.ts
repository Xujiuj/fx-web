import { prisma } from "@/lib/prisma";
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
export type FooterContent = { copyright: string; icpText: string; icpHref: string; ipv6Text: string };
export type ContactContent = { title: string; description: string; namePlaceholder: string; companyPlaceholder: string; contactPlaceholder: string; emailPlaceholder: string; messagePlaceholder: string; submitLabel: string; successLabel: string; errorLabel: string };

export type HomeContent = {
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
};

export type SubpageLayout = "training" | "practical" | "consulting" | "solution-platform" | "excel" | "product-platform" | "cases" | "knowledge" | "company" | "honors" | "partners" | "contact" | "service";
export type SubpageSection = {
  id: string;
  kind: "metrics" | "capabilities" | "process" | "resources" | "timeline" | "gallery" | "contacts";
  title: string;
  description?: string;
  items: Array<{ title: string; description?: string; value?: string; image?: string }>;
};

export type Subpage = {
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
};

type StoredSubpage = Omit<Subpage, "layout" | "sections"> & Partial<Pick<Subpage, "layout" | "sections">>;

const heroVisual = "/media/fengxing-hero-accounting.png";
const heroPlatform = "/media/fengxing-hero-management.png";
const platformImage = heroVisual;
const dataImage = heroPlatform;
const excelImage = "/media/about-philosophy-generated.png";
const standardFooter: FooterContent = {
  copyright: "© 新疆峰行智成数据科技有限责任公司 版权所有",
  icpText: "新ICP备2026004234号-1",
  icpHref: "https://beian.miit.gov.cn/",
  ipv6Text: "邮箱：gongyafeng@fengxingdata.com"
};

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
  "solution-standard": {},
  "solution-practical": {},
  "solution-consulting": {},
  "solution-platform": {},
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

function b2bMedia(src: string) {
  return legacyB2BMedia[src] ?? src;
}

function heroMedia(src: string) {
  return b2bMedia(src);
}

function normalizeHomeContent(content: HomeContent): HomeContent {
  const storedNews = content.newsItems ?? [];
  const storedPartners: unknown[] = Array.isArray(content.partners) ? content.partners : [];
  const hasLegacySolutionItems = storedNews.length > 0 && storedNews.every((item) => item.href.startsWith("/solution-"));

  return {
    ...content,
    site: { ...defaultHomeContent.site, ...content.site },
    navItems: cloneDefaultNavItems(),
    contact: { ...defaultHomeContent.contact, ...content.contact },
    footer: {
      ...(content.footer ?? standardFooter),
      icpText: standardFooter.icpText,
      icpHref: standardFooter.icpHref
    },
    heroSlides: content.heroSlides.map((slide, index) => ({
      ...slide,
      image: heroMedia(slide.image),
      href: slide.href ?? (index === 0 ? "/solution-standard" : "/#contact"),
      secondaryCta: slide.secondaryCta ?? (index === 0 ? "预约产品演示" : undefined),
      secondaryHref: slide.secondaryHref ?? "/#contact"
    })),
    aboutTabs: content.aboutTabs.map((tab) => {
      const fallback = defaultHomeContent.aboutTabs.find((entry) => entry.value === tab.value);
      return {
        ...tab,
        image: tab.image ?? fallback?.image,
        imageAlt: tab.imageAlt ?? fallback?.imageAlt ?? tab.title
      };
    }),
    timelineImage: content.timelineImage ?? defaultHomeContent.timelineImage,
    solutionItems: (content.solutionItems?.length ? content.solutionItems : defaultSolutionItems).map((item) => ({ ...item, image: b2bMedia(item.image) })),
    newsItems: (hasLegacySolutionItems || storedNews.length === 0 ? defaultLatestUpdates : storedNews).map((item) => ({
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
      thinkingEyebrow: content.sectionTitles?.thinkingEyebrow === "CORE CAPABILITIES" ? "" : content.sectionTitles?.thinkingEyebrow ?? "",
      thinkingTitle: content.sectionTitles?.thinkingTitle === "从核算走向持续碳管理" ? "THINKING" : content.sectionTitles?.thinkingTitle ?? "THINKING"
    }
  };
}

const defaultSolutionItems: NewsItem[] = [
  { title: "标准版", action: "核算培训", image: dataImage, href: "/solution-standard", summary: "建立温室气体核算基础" },
  { title: "实战营", action: "Excel 单公司版", image: excelImage, href: "/solution-practical", summary: "完成企业首次温室气体核算" },
  { title: "咨询版", action: "Excel 集团版", image: dataImage, href: "/solution-consulting", summary: "建立集团温室气体核算体系" },
  { title: "平台版", action: "平台管理", image: platformImage, href: "/solution-platform", summary: "建设企业碳数据管理平台" }
];

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
  { label: "产品中心", href: "/#products", children: [
    { label: "Excel版温室气体核算工具", href: "/excel-accounting-tool" },
    { label: "企业碳管理数字化平台", href: "/carbon-management-platform" }
  ] },
  { label: "客户案例", href: "/customer-cases" },
  { label: "知识课堂", href: "/knowledge-center", children: [
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
  return {
    ...page,
    layout: page.layout ?? subpageLayouts[page.slug] ?? "training",
    sections: page.sections?.length ? page.sections : buildStructuredSections(page),
    image: b2bMedia(page.image),
    media: Object.fromEntries(
      Object.entries({ ...(defaultPageMedia[page.slug] ?? {}), ...(page.media ?? {}) })
        .map(([key, value]) => [key, b2bMedia(value)])
    )
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
    logo: "/media/fengxing-logo.png",
    href: "/#home"
  },
  navItems: cloneDefaultNavItems(),
  heroSlides: [
    { eyebrow: "企业碳管理数字化服务商", title: "让碳数据从“算得出”走向“管得好、用得上、可价值化”", description: "专注企业温室气体核算与碳管理数字化建设，帮助企业建立从核算、管理到价值释放的长期能力体系。", image: heroVisual, cta: "了解解决方案", href: "/solution-standard", secondaryCta: "预约产品演示", secondaryHref: "/#contact" },
    { eyebrow: "一次维护，多口径核算", title: "构建可持续运行的企业碳管理能力", description: "以统一数据体系和集中核算引擎为核心，实现一次数据维护、多标准核算与多维分析。", image: heroPlatform, cta: "预约产品演示", href: "/#contact" }
  ],
  aboutTabs: [
    { value: "about", label: "公司介绍", title: "新疆峰行智成数据科技有限责任公司", kicker: "ABOUT US", body: "专注于为各类组织提供温室气体核算与碳管理数字化解决方案。通过统一数据体系与集中核算引擎，推动温室气体核算由“年度填报”向“持续管理”转变。", image: "/media/about-company-generated.png", imageAlt: "峰行智成团队协作场景" },
    { value: "mission", label: "企业使命", title: "以智慧驱动业务增长", kicker: "MISSION", body: "从培训赋能、咨询实施到数字化平台和持续运营，以标准化方法、可追溯数据与数字工具支撑企业长期碳管理。", image: "/media/about-philosophy-generated.png", imageAlt: "企业碳管理方法与数据模型" },
    { value: "vision", label: "企业愿景", title: "成为企业绿色低碳转型可信赖的长期合作伙伴", kicker: "VISION", body: "帮助企业建立从核算、管理到价值释放的长期能力体系，为监管履约、信息披露、供应链协同与低碳决策提供稳定的数据基础。", image: "/media/about-vision-generated.png", imageAlt: "企业绿色低碳转型愿景" }
  ],
  timeline: [
    { year: "01", items: ["标准版", "核算培训", "建立温室气体核算基础"] },
    { year: "02", items: ["实战营", "Excel 单公司版", "完成企业首次温室气体核算"] },
    { year: "03", items: ["咨询版", "Excel 集团版", "建立集团温室气体核算体系"] },
    { year: "04", items: ["平台版", "平台管理", "建设企业碳数据管理平台"] }
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
  sectionTitles: { timeline: "企业碳管理能力建设路径", solutions: "全阶段解决方案", news: "最新动态", products: "产品中心", certificates: "资质荣誉", partners: "合作伙伴", thinkingEyebrow: "", thinkingTitle: "THINKING", contact: "联系峰行智成" },
  thinkingText: "以温室气体核算为起点，通过数据采集、数据治理、核算分析、管理决策和持续运营，推动企业沉淀可追溯、可复用的碳数据资产。",
  contact: { title: "联系峰行智成", description: "业务咨询：15099663016｜gongyafeng@fengxingdata.com", namePlaceholder: "联系人", companyPlaceholder: "企业名称", contactPlaceholder: "请输入手机号或微信号", emailPlaceholder: "联系邮箱", messagePlaceholder: "企业需求", submitLabel: "提交咨询", successLabel: "咨询已提交", errorLabel: "提交失败，请稍后重试。" },
  footer: standardFooter
};

const defaultCustomerCaseSections: SubpageSection[] = [{
  id: "applications",
  kind: "gallery",
  title: "围绕碳管理，连接关键业务数据",
  description: "应用场景",
  items: [
    { title: "温室气体核算", description: "围绕固定燃烧、外购电力和生产过程数据，明确组织与运营边界，形成可复核的温室气体核算基础。", image: "/media/manufacturing-carbon-accounting.png" },
    { title: "活动数据治理", description: "梳理能源、原辅料、生产与运输等活动数据的来源、责任人和维护频率，建立统一的数据口径。", image: "/media/manufacturing-carbon-governance.png" },
    { title: "碳数据分析", description: "通过总量、强度、基准年和趋势分析，帮助企业识别重点排放环节，为减排管理和披露准备提供依据。", image: "/media/manufacturing-carbon-analytics.png" },
    { title: "持续运营管理", description: "以 Excel 核算工具或数字化平台支持多年度更新、集团汇总和过程追溯，让碳管理成为持续可用的业务能力。", image: "/media/manufacturing-carbon-operations.png" }
  ]
}];

export const defaultSubpages: Subpage[] = normalizeSubpagesContent([
  { slug: "solution-standard", navLabel: "标准版（培训赋能）", eyebrow: "SOLUTION 01", title: "标准版（培训赋能）", summary: "帮助企业快速掌握温室气体核算方法。", image: excelImage, icon: "users", metrics: [{ label: "服务形式", value: "专项培训" }, { label: "培训重点", value: "核算方法" }, { label: "适用阶段", value: "启动准备" }], features: ["GHG Protocol 核算方法", "ISO 14064-1 核算要求", "GB/T 32150 核算规范", "企业场景实操演练"], steps: ["明确培训范围与参与人员", "梳理核算对象与数据来源", "结合企业场景进行演练", "形成后续核算工作清单"] },
  { slug: "solution-practical", navLabel: "实战营（Excel单公司版）", eyebrow: "SOLUTION 02", title: "实战营（Excel单公司版）", summary: "帮助企业完成首次核算闭环。", image: excelImage, icon: "chart", metrics: [{ label: "适用组织", value: "单一法人" }, { label: "交付工具", value: "Excel 模板" }, { label: "交付成果", value: "核算报告" }], features: ["活动数据台账梳理", "Excel 单公司版配置", "历史年度数据整理", "范围一、范围二及适用范围三核算"], steps: ["梳理核算边界", "收集并复核活动数据", "配置排放因子与计算规则", "交付核算报告和工作底稿"] },
  { slug: "solution-consulting", navLabel: "咨询版（Excel集团版）", eyebrow: "SOLUTION 03", title: "咨询版（Excel集团版）", summary: "建立集团统一核算管理体系。", image: dataImage, icon: "building", metrics: [{ label: "适用组织", value: "集团企业" }, { label: "管理方式", value: "统一口径" }, { label: "汇总方式", value: "集中复核" }], features: ["成员企业独立核算", "集团数据汇总", "统一数据模板与核算口径", "披露与供应链数据准备"], steps: ["梳理集团组织边界", "制定统一核算规则", "部署成员企业核算工具", "汇总复核并安排年度更新"] },
  { slug: "solution-platform", navLabel: "平台版（数字化升级）", eyebrow: "SOLUTION 04", title: "平台版（数字化升级）", summary: "建设企业长期碳管理能力。", image: platformImage, icon: "sparkles", metrics: [{ label: "数据范围", value: "统一管理" }, { label: "组织范围", value: "多层级" }, { label: "使用方式", value: "持续维护" }], features: ["多标准温室气体核算", "核算数据与结果统一管理", "基准年和排放趋势分析", "数据来源与计算过程可追溯"], steps: ["梳理业务需求和管理范围", "确认核算边界与数据标准", "建立数据模型和因子规则", "上线运行并安排日常维护"] },
  { slug: "excel-accounting-tool", navLabel: "Excel版温室气体核算工具", eyebrow: "PRODUCT", title: "Excel版温室气体核算工具", summary: "帮助企业快速建立温室气体核算能力，兼顾单公司与集团两类组织场景。", image: excelImage, icon: "chart", metrics: [{ label: "产品版本", value: "2类" }, { label: "年度分析", value: "支持" }, { label: "集团汇总", value: "自动" }], features: ["单公司版与集团版", "多年数据横向积累", "核算口径统一", "结果自动更新与清晰追溯"], steps: ["选择组织版本", "配置核算边界", "维护活动数据", "生成核算与分析结果"] },
  { slug: "carbon-management-platform", navLabel: "企业碳管理数字化平台", eyebrow: "PRODUCT", title: "企业碳管理数字化平台", summary: "构建企业统一碳数据体系，实现一次数据维护、多口径核算、多维分析与长期持续管理。", image: "/media/product-platform-hero.webp", icon: "database", metrics: [{ label: "数据体系", value: "统一" }, { label: "核算引擎", value: "集中" }, { label: "数据链路", value: "可追溯" }], features: ["排放边界、排放源、活动数据与排放因子统一管理", "CO2e总量、活动数据、七种温室气体与排放强度分析", "多组织、多年度、多口径灵活切换", "基准年、趋势、强度和工厂对标分析"], steps: ["建立统一数据模型", "配置标准与排放因子", "接入并维护活动数据", "自动核算、分析与管理决策"] },
  { slug: "customer-cases", layout: "cases", navLabel: "企业碳管理数字化", eyebrow: "INDUSTRY CASE", title: "制造行业", summary: "我们面向制造企业提供温室气体核算、碳管理体系建设与数字化平台服务，围绕生产环节、能源消耗和工厂边界建立清晰的数据基础，支持企业开展核算、分析与持续管理。", image: dataImage, icon: "building", metrics: [{ label: "覆盖场景", value: "4类" }, { label: "工作起点", value: "业务数据" }, { label: "管理目标", value: "长期使用" }], features: ["制造业", "能源与公用事业", "园区与多组织管理", "供应链与品牌企业"], steps: ["明确业务边界与管理目标", "梳理数据来源与责任分工", "统一核算口径与复核方式", "形成可持续更新的管理成果"], sections: defaultCustomerCaseSections },
  { slug: "knowledge-center", navLabel: "知识课堂", eyebrow: "KNOWLEDGE", title: "企业碳管理学习与能力提升平台", summary: "围绕双碳政策、温室气体核算、ESG、CDP、CBAM和碳市场动态，提供专栏、课程与资料。", image: dataImage, icon: "sparkles", metrics: [{ label: "内容栏目", value: "3类" }, { label: "课程方向", value: "5类" }, { label: "服务对象", value: "企业" }], features: ["双碳政策与碳市场解读", "温室气体核算与Excel实战", "集团核算体系与数字化平台培训", "ESG、CDP与CBAM基础内容"], steps: ["双碳专栏", "视频课程", "产品与解决方案资料", "核算工具下载"] },
  { slug: "company-profile", navLabel: "企业介绍", eyebrow: "ABOUT", title: "新疆峰行智成数据科技有限责任公司", summary: "企业碳管理数字化服务商，专注为各类组织提供温室气体核算、碳管理体系建设和数字化平台服务。", image: platformImage, icon: "users", metrics: [{ label: "企业使命", value: "智慧驱动" }, { label: "能力定位", value: "碳管理" }, { label: "服务方式", value: "全周期" }], features: ["温室气体核算", "碳管理咨询", "数字化平台", "培训、实施与持续运营"], steps: ["识别企业所处阶段", "匹配能力建设路径", "交付工具与平台", "支持长期运营"] },
  { slug: "company-honors", layout: "honors", navLabel: "企业荣誉", eyebrow: "HONORS", title: "企业荣誉", summary: "我们重视每一项可核验的专业认可，相关资质与荣誉将以有效文件为准持续更新。", image: heroPlatform, icon: "shield", metrics: [], features: [], steps: [], sections: [{ id: "honors", kind: "gallery", title: "荣誉展示", description: "已公开展示的证书、资质和荣誉，均可在后台独立维护。", items: [] }] },
  { slug: "company-partners", layout: "partners", navLabel: "合作伙伴", eyebrow: "PARTNERS", title: "合作伙伴", summary: "与客户及生态伙伴的合作，以项目实际需求和双方确认的信息为基础。", image: heroVisual, icon: "users", metrics: [], features: [], steps: [], sections: [{ id: "partners", kind: "gallery", title: "合作伙伴", description: "感谢每一位与峰行智成共同推进企业碳管理建设的伙伴。", items: [] }] },
  { slug: "company-contact", layout: "contact", navLabel: "联系我们", eyebrow: "CONTACT", title: "联系我们", summary: "围绕温室气体核算、碳管理咨询和数字化建设，欢迎与我们沟通您的业务需求。", image: heroVisual, icon: "users", metrics: [], features: [], steps: [], sections: [{ id: "contact", kind: "contacts", title: "联系信息", description: "我们将在收到信息后尽快与您沟通。", items: [{ title: "业务咨询", value: "15099663016", description: "工作日可通过电话联系" }, { title: "电子邮箱", value: "gongyafeng@fengxingdata.com", description: "可发送项目资料或合作需求" }] }] },
  { slug: "service-capability-path", layout: "service", navLabel: "能力建设路径", eyebrow: "IMPLEMENTATION", title: "能力建设路径", summary: "从核算基础、数据治理到持续运营，结合企业实际阶段建立可持续使用的碳管理能力。", image: "/media/service-capability-path-hero.png", icon: "workflow", metrics: [], features: [], steps: [], sections: [{ id: "capability-visual", kind: "gallery", title: "能力建设", items: [{ title: "企业碳数据治理路径", description: "围绕数据边界、责任分工、数据质量和持续更新，逐步沉淀可用于核算、分析和管理的碳数据基础。", image: "/media/service-capability-path-content.png" }] }] },
  { slug: "service-training-consulting", layout: "service", navLabel: "培训与咨询实施", eyebrow: "IMPLEMENTATION", title: "培训与咨询实施", summary: "围绕企业温室气体核算与碳管理需求，提供培训、数据梳理、方法辅导和过程复核支持。", image: "/media/service-training-consulting-hero.png", icon: "users", metrics: [], features: [], steps: [], sections: [{ id: "training-visual", kind: "gallery", title: "实施流程", items: [{ title: "核算培训与实操流程", description: "以统一方法、业务数据和过程复核为基础，将培训内容转化为企业可以延续使用的核算工作流程。", image: "/media/service-training-consulting-content.png" }] }] },
  { slug: "service-platform-delivery", layout: "service", navLabel: "数字化平台实施", eyebrow: "IMPLEMENTATION", title: "数字化平台实施", summary: "以统一数据体系和核算规则为基础，实施企业碳管理数字化平台，支持长期维护与持续分析。", image: "/media/service-platform-delivery-hero.png", icon: "database", metrics: [], features: [], steps: [], sections: [{ id: "platform-visual", kind: "gallery", title: "平台建设", items: [{ title: "企业碳管理平台架构", description: "以数据模型、核算规则和分析应用为主线，支持多组织、多年度的持续维护与管理使用。", image: "/media/service-platform-delivery-content.png" }] }] }
]);

function normalizeStoredSubpages(content: StoredSubpage[]): Subpage[] {
  const stored = normalizeSubpagesContent(content).map((page) => {
    const fallback = defaultSubpages.find((entry) => entry.slug === page.slug);
    const withDefaultSections = page.sections.length === 0 && fallback?.sections.length ? { ...page, sections: fallback.sections } : page;
    const withDefaultMedia = fallback?.media
      ? { ...withDefaultSections, media: { ...fallback.media, ...withDefaultSections.media } }
      : withDefaultSections;
    return withDefaultMedia.slug === "carbon-management-platform" && withDefaultMedia.image === platformImage
      ? { ...withDefaultMedia, image: "/media/product-platform-hero.webp" }
      : withDefaultMedia;
  });
  return stored;
}

export type ContentVersions = { home: number; subpages: number };
export type SiteContentBundle = { home: HomeContent; subpages: Subpage[]; versions: ContentVersions };

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
  try {
    const record = await prisma.siteContent.findUnique({ where: { key: "home" } });
    return normalizeHomeContent(record ? parseConfig(record.value, defaultHomeContent) : defaultHomeContent);
  } catch {
    return defaultHomeContent;
  }
}

async function loadSubpages(): Promise<Subpage[]> {
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

export async function getSubpageContent(slug: string): Promise<Subpage | null> {
  const subpages = await loadSubpages();
  return subpages.find((page) => page.slug === slug) ?? null;
}

export async function getSiteContentBundle(): Promise<SiteContentBundle> {
  try {
    const records = await prisma.siteContent.findMany({ where: { key: { in: ["home", "subpages"] } } });
    const homeRecord = records.find((record) => record.key === "home");
    const subpagesRecord = records.find((record) => record.key === "subpages");
    return {
      home: normalizeHomeContent(homeRecord ? parseConfig(homeRecord.value, defaultHomeContent) : defaultHomeContent),
      subpages: subpagesRecord ? normalizeStoredSubpages(parseConfig(subpagesRecord.value, defaultSubpages)) : defaultSubpages,
      versions: { home: homeRecord?.version ?? 0, subpages: subpagesRecord?.version ?? 0 }
    };
  } catch {
    return { home: defaultHomeContent, subpages: defaultSubpages, versions: { home: 0, subpages: 0 } };
  }
}

export async function saveSiteContentBundle(
  bundle: Pick<SiteContentBundle, "home" | "subpages">,
  expectedVersions: ContentVersions
): Promise<ContentVersions> {
  return prisma.$transaction(async (tx) => {
    const records = await tx.siteContent.findMany({ where: { key: { in: ["home", "subpages"] } } });
    const homeRecord = records.find((record) => record.key === "home");
    const subpagesRecord = records.find((record) => record.key === "subpages");
    const current = { home: homeRecord?.version ?? 0, subpages: subpagesRecord?.version ?? 0 };

    if (current.home !== expectedVersions.home || current.subpages !== expectedVersions.subpages) {
      throw new ContentConflictError();
    }

    const home = await tx.siteContent.upsert({
      where: { key: "home" },
      update: { value: JSON.stringify(bundle.home, null, 2), version: { increment: 1 } },
      create: { key: "home", value: JSON.stringify(bundle.home, null, 2), version: 1 }
    });
    const subpages = await tx.siteContent.upsert({
      where: { key: "subpages" },
      update: { value: JSON.stringify(bundle.subpages, null, 2), version: { increment: 1 } },
      create: { key: "subpages", value: JSON.stringify(bundle.subpages, null, 2), version: 1 }
    });

    return { home: home.version, subpages: subpages.version };
  });
}
