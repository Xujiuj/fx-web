import { prisma } from "@/lib/prisma";
export type IconKey = "chart" | "building" | "database" | "layers" | "line" | "shield" | "sparkles" | "users" | "workflow";

export type NavChild = { label: string; href: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };
export type HeroSlide = { eyebrow: string; title: string; description: string; image: string; cta: string };
export type AboutTab = { value: string; label: string; title: string; kicker: string; body: string };
export type TimelineEntry = { year: string; items: string[] };
export type NewsItem = { title: string; action: string; image: string; href: string; summary?: string };
export type ProductItem = { name: string; summary: string; icon: IconKey; href: string };
export type CapabilityItem = { label: string; icon: IconKey };
export type PartnerItem = { name: string; logo?: string };
export type FooterContent = { copyright: string; icpText: string; icpHref: string; ipv6Text: string };
export type ContactContent = { title: string; description: string; namePlaceholder: string; companyPlaceholder: string; emailPlaceholder: string; messagePlaceholder: string; submitLabel: string; successLabel: string; errorLabel: string };

export type HomeContent = {
  brand: { name: string; logo: string; href: string };
  navItems: NavItem[];
  heroSlides: HeroSlide[];
  aboutTabs: AboutTab[];
  timeline: TimelineEntry[];
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

export type SubpageLayout = "training" | "practical" | "consulting" | "solution-platform" | "excel" | "product-platform" | "cases" | "knowledge" | "company";
export type SubpageSection = {
  id: string;
  kind: "metrics" | "capabilities" | "process" | "resources" | "timeline";
  title: string;
  description?: string;
  items: Array<{ title: string; description?: string; value?: string }>;
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
};

type StoredSubpage = Omit<Subpage, "layout" | "sections"> & Partial<Pick<Subpage, "layout" | "sections">>;

const heroVisual = "/media/fengxing-hero-accounting.png";
const heroPlatform = "/media/fengxing-hero-management.png";
const platformImage = heroVisual;
const dataImage = heroPlatform;
const excelImage = "/media/about-philosophy-generated.png";

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
  const hasLegacyNavigation = content.navItems?.some((item) => ["产品中心", "客户案例", "知识课堂"].includes(item.label));

  return {
    ...content,
    navItems: hasLegacyNavigation ? defaultNavItems : content.navItems,
    heroSlides: content.heroSlides.map((slide) => ({ ...slide, image: heroMedia(slide.image) })),
    solutionItems: (content.solutionItems?.length ? content.solutionItems : defaultSolutionItems).map((item) => ({ ...item, image: b2bMedia(item.image) })),
    newsItems: (hasLegacySolutionItems || storedNews.length === 0 ? defaultLatestUpdates : storedNews).map((item) => ({ ...item, image: b2bMedia(item.image) })),
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
      news: hasLegacySolutionItems ? "最新动态" : content.sectionTitles?.news ?? "最新动态"
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
  { title: "温室气体核算边界如何确定？", action: "核算方法", image: dataImage, href: "/knowledge-center", summary: "从组织边界、运营边界到排放源识别，建立一致的核算口径。" },
  { title: "集团企业如何实现碳数据统一汇总？", action: "集团管理", image: dataImage, href: "/knowledge-center", summary: "以统一数据结构和核算规则支撑分子公司协同与集团汇总。" },
  { title: "从年度填报走向持续碳管理", action: "数字化实践", image: dataImage, href: "/knowledge-center", summary: "让数据采集、核算分析与管理决策形成可持续运行的闭环。" }
];

const defaultNavItems: NavItem[] = [
  { label: "首页", href: "/#home" },
  { label: "产品", href: "/#products", children: [
    { label: "Excel版温室气体核算工具", href: "/excel-accounting-tool" },
    { label: "企业碳管理数字化平台", href: "/carbon-management-platform" }
  ] },
  { label: "解决方案", href: "/#solutions", children: [
    { label: "标准版（核算培训）", href: "/solution-standard" },
    { label: "实战营（Excel 单公司版）", href: "/solution-practical" },
    { label: "咨询版（Excel 集团版）", href: "/solution-consulting" },
    { label: "平台版（平台管理）", href: "/solution-platform" }
  ] },
  { label: "实施服务", href: "/#path", children: [
    { label: "能力建设路径", href: "/#path" },
    { label: "培训与咨询实施", href: "/solution-standard" },
    { label: "数字化平台实施", href: "/solution-platform" }
  ] },
  { label: "行业案例", href: "/customer-cases" },
  { label: "关于我们", href: "/company-profile", children: [
    { label: "公司介绍", href: "/company-profile" },
    { label: "知识课堂", href: "/knowledge-center" },
    { label: "联系我们", href: "/#contact" }
  ] }
];

const subpageLayouts: Record<string, SubpageLayout> = {
  "solution-standard": "training",
  "solution-practical": "practical",
  "solution-consulting": "consulting",
  "solution-platform": "solution-platform",
  "excel-accounting-tool": "excel",
  "carbon-management-platform": "product-platform",
  "customer-cases": "cases",
  "knowledge-center": "knowledge",
  "company-profile": "company"
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
    image: b2bMedia(page.image)
  };
}

function normalizeSubpagesContent(content: StoredSubpage[]): Subpage[] {
  return content.map(normalizeSubpage);
}

export const defaultHomeContent: HomeContent = {
  brand: {
    name: "峰行智成",
    logo: "/media/fengxing-logo.png",
    href: "/#home"
  },
  navItems: [
    { label: "首页", href: "/#home" },
    { label: "产品", href: "/#products", children: [
      { label: "Excel版温室气体核算工具", href: "/excel-accounting-tool" },
      { label: "企业碳管理数字化平台", href: "/carbon-management-platform" }
    ] },
    { label: "解决方案", href: "/#solutions", children: [
      { label: "标准版（核算培训）", href: "/solution-standard" },
      { label: "实战营（Excel 单公司版）", href: "/solution-practical" },
      { label: "咨询版（Excel 集团版）", href: "/solution-consulting" },
      { label: "平台版（平台管理）", href: "/solution-platform" }
    ] },
    { label: "实施服务", href: "/#path", children: [
      { label: "能力建设路径", href: "/#path" },
      { label: "培训与咨询实施", href: "/solution-standard" },
      { label: "数字化平台实施", href: "/solution-platform" }
    ] },
    { label: "行业案例", href: "/customer-cases" },
    { label: "关于我们", href: "/company-profile", children: [
      { label: "公司介绍", href: "/company-profile" },
      { label: "知识课堂", href: "/knowledge-center" },
      { label: "联系我们", href: "/#contact" }
    ] },
  ],
  heroSlides: [
    { eyebrow: "企业碳管理数字化服务商", title: "让碳数据从“算得出”走向“管得好、用得上、可价值化”", description: "专注企业温室气体核算与碳管理数字化建设，帮助企业建立从核算、管理到价值释放的长期能力体系。", image: heroVisual, cta: "了解解决方案" },
    { eyebrow: "一次维护，多口径核算", title: "构建可持续运行的企业碳管理能力", description: "以统一数据体系和集中核算引擎为核心，实现一次数据维护、多标准核算与多维分析。", image: heroPlatform, cta: "预约产品演示" }
  ],
  aboutTabs: [
    { value: "about", label: "公司介绍", title: "新疆峰行智成数据科技有限责任公司", kicker: "ABOUT US", body: "专注于为各类组织提供温室气体核算与碳管理数字化解决方案。通过统一数据体系与集中核算引擎，推动温室气体核算由“年度填报”向“持续管理”转变。" },
    { value: "mission", label: "企业使命", title: "以智慧驱动业务增长", kicker: "MISSION", body: "从培训赋能、咨询实施到数字化平台和持续运营，以标准化方法、可追溯数据与数字工具支撑企业长期碳管理。" },
    { value: "vision", label: "企业愿景", title: "成为企业绿色低碳转型可信赖的长期合作伙伴", kicker: "VISION", body: "帮助企业建立从核算、管理到价值释放的长期能力体系，为监管履约、信息披露、供应链协同与低碳决策提供稳定的数据基础。" }
  ],
  timeline: [
    { year: "01", items: ["标准版", "核算培训", "建立温室气体核算基础"] },
    { year: "02", items: ["实战营", "Excel 单公司版", "完成企业首次温室气体核算"] },
    { year: "03", items: ["咨询版", "Excel 集团版", "建立集团温室气体核算体系"] },
    { year: "04", items: ["平台版", "平台管理", "建设企业碳数据管理平台"] }
  ],
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
  sectionTitles: { timeline: "企业碳管理能力建设路径", solutions: "全阶段解决方案", news: "最新动态", products: "产品中心", certificates: "资质荣誉", partners: "合作伙伴", thinkingEyebrow: "CORE CAPABILITIES", thinkingTitle: "从核算走向持续碳管理", contact: "联系峰行智成" },
  thinkingText: "以温室气体核算为起点，通过数据采集、数据治理、核算分析、管理决策和持续运营，推动企业沉淀可追溯、可复用的碳数据资产。",
  contact: { title: "联系峰行智成", description: "业务咨询：15099663016｜gongyafeng@fengxingdata.com", namePlaceholder: "联系人", companyPlaceholder: "企业名称", emailPlaceholder: "联系邮箱", messagePlaceholder: "企业需求", submitLabel: "提交咨询", successLabel: "咨询已提交", errorLabel: "提交失败，请稍后重试。" },
  footer: { copyright: "版权所有 新疆峰行智成数据科技有限责任公司", icpText: "电话：15099663016", icpHref: "tel:15099663016", ipv6Text: "gongyafeng@fengxingdata.com" }
};

export const defaultSubpages: Subpage[] = normalizeSubpagesContent([
  { slug: "solution-standard", navLabel: "标准版（核算培训）", eyebrow: "SOLUTION 01", title: "建立企业温室气体核算基础", summary: "面向准备开展温室气体核算的企业，围绕核算边界、数据收集、排放因子和结果复核开展培训。", image: excelImage, icon: "users", metrics: [{ label: "服务形式", value: "专项培训" }, { label: "培训重点", value: "核算方法" }, { label: "适用阶段", value: "启动准备" }], features: ["GHG Protocol 核算方法", "ISO 14064-1 核算要求", "GB/T 32150 核算规范", "企业场景实操演练"], steps: ["明确培训范围与参与人员", "梳理核算对象与数据来源", "结合企业场景进行演练", "形成后续核算工作清单"] },
  { slug: "solution-practical", navLabel: "实战营（Excel 单公司版）", eyebrow: "SOLUTION 02", title: "完成企业首次温室气体核算", summary: "通过梳理活动数据、配置核算工具、开展过程复核，形成可用于内部管理和对外填报的温室气体核算结果。", image: excelImage, icon: "chart", metrics: [{ label: "适用组织", value: "单一法人" }, { label: "交付工具", value: "Excel 模板" }, { label: "交付成果", value: "核算报告" }], features: ["活动数据台账梳理", "Excel 单公司版配置", "历史年度数据整理", "范围一、范围二及适用范围三核算"], steps: ["梳理核算边界", "收集并复核活动数据", "配置排放因子与计算规则", "交付核算报告和工作底稿"] },
  { slug: "solution-consulting", navLabel: "咨询版（Excel 集团版）", eyebrow: "SOLUTION 03", title: "建立集团温室气体核算体系", summary: "面向多法人、多层级组织，建立集团统一的核算口径、数据模板和汇总规则，支持成员企业分别维护和集团统一复核。", image: dataImage, icon: "building", metrics: [{ label: "适用组织", value: "集团企业" }, { label: "管理方式", value: "统一口径" }, { label: "汇总方式", value: "集中复核" }], features: ["成员企业独立核算", "集团数据汇总", "统一数据模板与核算口径", "披露与供应链数据准备"], steps: ["梳理集团组织边界", "制定统一核算规则", "部署成员企业核算工具", "汇总复核并安排年度更新"] },
  { slug: "solution-platform", navLabel: "平台版（数字化管理）", eyebrow: "SOLUTION 04", title: "建设企业碳数据管理平台", summary: "统一管理活动数据、核算规则和结果分析，支持多组织、多年度的温室气体核算与管理数据查询。", image: platformImage, icon: "sparkles", metrics: [{ label: "数据范围", value: "统一管理" }, { label: "组织范围", value: "多层级" }, { label: "使用方式", value: "持续维护" }], features: ["多标准温室气体核算", "核算数据与结果统一管理", "基准年和排放趋势分析", "数据来源与计算过程可追溯"], steps: ["梳理业务需求和管理范围", "确认核算边界与数据标准", "建立数据模型和因子规则", "上线运行并安排日常维护"] },
  { slug: "excel-accounting-tool", navLabel: "Excel版温室气体核算工具", eyebrow: "PRODUCT", title: "Excel版温室气体核算工具", summary: "帮助企业快速建立温室气体核算能力，兼顾单公司与集团两类组织场景。", image: excelImage, icon: "chart", metrics: [{ label: "产品版本", value: "2类" }, { label: "年度分析", value: "支持" }, { label: "集团汇总", value: "自动" }], features: ["单公司版与集团版", "多年数据横向积累", "核算口径统一", "结果自动更新与清晰追溯"], steps: ["选择组织版本", "配置核算边界", "维护活动数据", "生成核算与分析结果"] },
  { slug: "carbon-management-platform", navLabel: "企业碳管理数字化平台", eyebrow: "PRODUCT", title: "企业碳管理数字化平台", summary: "构建企业统一碳数据体系，实现一次数据维护、多口径核算、多维分析与长期持续管理。", image: platformImage, icon: "database", metrics: [{ label: "数据体系", value: "统一" }, { label: "核算引擎", value: "集中" }, { label: "数据链路", value: "可追溯" }], features: ["排放边界、排放源、活动数据与排放因子统一管理", "CO2e总量、活动数据、七种温室气体与排放强度分析", "多组织、多年度、多口径灵活切换", "基准年、趋势、强度和工厂对标分析"], steps: ["建立统一数据模型", "配置标准与排放因子", "接入并维护活动数据", "自动核算、分析与管理决策"] },
  { slug: "customer-cases", navLabel: "行业案例", eyebrow: "INDUSTRY CASES", title: "行业案例", summary: "面向制造、能源、园区和供应链等业务场景，围绕数据基础、核算边界和管理目标开展碳管理建设。", image: dataImage, icon: "building", metrics: [{ label: "覆盖场景", value: "4类" }, { label: "工作起点", value: "业务数据" }, { label: "管理目标", value: "长期使用" }], features: ["制造业", "能源与公用事业", "园区与多组织管理", "供应链与品牌企业"], steps: ["明确业务边界与管理目标", "梳理数据来源与责任分工", "统一核算口径与复核方式", "形成可持续更新的管理成果"] },
  { slug: "knowledge-center", navLabel: "知识课堂", eyebrow: "KNOWLEDGE", title: "企业碳管理学习与能力提升平台", summary: "围绕双碳政策、温室气体核算、ESG、CDP、CBAM和碳市场动态，提供专栏、课程与资料。", image: dataImage, icon: "sparkles", metrics: [{ label: "内容栏目", value: "3类" }, { label: "课程方向", value: "5类" }, { label: "服务对象", value: "企业" }], features: ["双碳政策与碳市场解读", "温室气体核算与Excel实战", "集团核算体系与数字化平台培训", "ESG、CDP与CBAM基础内容"], steps: ["双碳专栏", "视频课程", "产品与解决方案资料", "核算工具下载"] },
  { slug: "company-profile", navLabel: "公司介绍", eyebrow: "ABOUT", title: "新疆峰行智成数据科技有限责任公司", summary: "企业碳管理数字化服务商，专注为各类组织提供温室气体核算、碳管理体系建设和数字化平台服务。", image: platformImage, icon: "users", metrics: [{ label: "企业使命", value: "智慧驱动" }, { label: "能力定位", value: "碳管理" }, { label: "服务方式", value: "全周期" }], features: ["温室气体核算", "碳管理咨询", "数字化平台", "培训、实施与持续运营"], steps: ["识别企业所处阶段", "匹配能力建设路径", "交付工具与平台", "支持长期运营"] }
]);

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

export async function getSubpagesContent(): Promise<Subpage[]> {
  try {
    const record = await prisma.siteContent.findUnique({ where: { key: "subpages" } });
    return normalizeSubpagesContent(record ? parseConfig(record.value, defaultSubpages) : defaultSubpages);
  } catch {
    return defaultSubpages;
  }
}

export async function getSubpageContent(slug: string): Promise<Subpage> {
  const subpages = await getSubpagesContent();
  return subpages.find((page) => page.slug === slug) ?? {
    ...defaultSubpages[0],
    slug,
    navLabel: slug,
    eyebrow: "FENGXING DATA",
    title: "峰行智成业务页面",
    summary: "该页面由后台内容配置生成，可在管理后台继续补充结构和文案。"
  };
}

export async function getSiteContentBundle(): Promise<SiteContentBundle> {
  try {
    const records = await prisma.siteContent.findMany({ where: { key: { in: ["home", "subpages"] } } });
    const homeRecord = records.find((record) => record.key === "home");
    const subpagesRecord = records.find((record) => record.key === "subpages");
    return {
      home: normalizeHomeContent(homeRecord ? parseConfig(homeRecord.value, defaultHomeContent) : defaultHomeContent),
      subpages: normalizeSubpagesContent(subpagesRecord ? parseConfig(subpagesRecord.value, defaultSubpages) : defaultSubpages),
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
