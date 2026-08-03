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

export type HomeEditorialContent = {
  path: {
    eyebrow: string;
    title: string;
    description: string;
    summary: string;
  };
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
  ipv6Text: "邮箱：service@fengxingdata.com"
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
  "solution-standard": { diagram: "/materials/20260803/资料20260803/解决方案/课程宣传图制作_企业温室气体核算实战（Excel版）_扩展版.svg" },
  "solution-practical": { diagram: "/media/reference-diagrams/agile-implementation.svg" },
  "solution-consulting": { diagram: "/media/reference-diagrams/group-implementation.svg" },
  "solution-platform": { diagram: "/media/reference-diagrams/carbon-data-governance.svg" },
  "excel-accounting-tool": { screenshot: "/media/product-excel-report.webp", diagram: "/media/reference-diagrams/data-modeling-flow.svg" },
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
    brand: { ...content.brand, logo: "/media/fengxing-logo-transparent.png" },
    navItems: cloneDefaultNavItems(),
    contact: {
      ...defaultHomeContent.contact,
      ...content.contact,
      description: (content.contact?.description ?? defaultHomeContent.contact.description)
        .replace(/[A-Z0-9._%+-]+@fengxingdata\.com/gi, "service@fengxingdata.com")
    },
    footer: {
      ...(content.footer ?? standardFooter),
      icpText: standardFooter.icpText,
      icpHref: standardFooter.icpHref,
      ipv6Text: standardFooter.ipv6Text
    },
    // The public homepage follows the approved single-banner structure even
    // when an older CMS snapshot still contains the former carousel content.
    heroSlides: defaultHomeContent.heroSlides.map((slide) => ({
      ...slide,
      image: heroMedia(slide.image)
    })),
    aboutTabs: content.aboutTabs.map((tab) => {
      const fallback = defaultHomeContent.aboutTabs.find((entry) => entry.value === tab.value);
      return {
        ...tab,
        image: tab.image ?? fallback?.image,
        imageAlt: tab.imageAlt ?? fallback?.imageAlt ?? tab.title
      };
    }),
    timeline: defaultHomeContent.timeline.map((entry) => ({ ...entry, items: [...entry.items] })),
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

export const homeEditorialContent: HomeEditorialContent = {
  path: {
    eyebrow: "CAPABILITY PATH",
    title: "从认知建立到数字化运营",
    description: "企业碳管理能力建设路径",
    summary: "企业碳管理能力建设并非一次性项目，而是从方法认知、核算实践、体系建设到数字化运营逐步演进的过程。峰行智成基于企业不同阶段需求，提供全生命周期解决方案。"
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
  const storedMedia = Object.fromEntries(
    Object.entries(page.media ?? {}).filter(([, value]) => typeof value === "string" && value.trim().length > 0)
  );
  const media = Object.fromEntries(
    Object.entries({ ...(defaultPageMedia[page.slug] ?? {}), ...storedMedia })
      .map(([key, value]) => [key, b2bMedia(value)])
  );
  return {
    ...page,
    layout: page.layout ?? subpageLayouts[page.slug] ?? "training",
    sections: page.sections?.length ? page.sections : buildStructuredSections(page),
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
  sectionTitles: { timeline: "企业碳管理能力建设路径", solutions: "全阶段解决方案", news: "最新动态", products: "产品中心", certificates: "资质荣誉", partners: "合作伙伴", thinkingEyebrow: "", thinkingTitle: "THINKING", contact: "联系峰行智成" },
  thinkingText: "以温室气体核算为起点，通过数据采集、数据治理、核算分析、管理决策和持续运营，推动企业沉淀可追溯、可复用的碳数据资产。",
  contact: { title: "联系峰行智成", description: "业务咨询：15099663016｜service@fengxingdata.com", namePlaceholder: "联系人", companyPlaceholder: "企业名称", contactPlaceholder: "请输入手机号或微信号", emailPlaceholder: "联系邮箱", messagePlaceholder: "企业需求", submitLabel: "提交咨询", successLabel: "咨询已提交", errorLabel: "提交失败，请稍后重试。" },
  footer: standardFooter
};

const defaultCustomerCaseSections: SubpageSection[] = [{
  id: "case-categories",
  kind: "gallery",
  title: "按能力建设路径展示案例",
  description: "案例统一按照项目背景、面临问题、建设内容、实施过程、建设成果与客户价值组织。",
  items: [
    { title: "培训赋能案例", description: "帮助企业统一标准认知，掌握温室气体核算方法并培养内部人才。" },
    { title: "Excel单公司版案例", description: "帮助单一法人企业梳理数据台账，完成首次核算闭环并形成标准成果。" },
    { title: "Excel集团版案例", description: "帮助集团统一成员企业核算口径，实现独立核算、自动汇总与集中复核。" },
    { title: "数字化平台案例", description: "帮助企业建设统一碳数据体系，实现自动核算、多维分析与持续运营。" }
  ]
}];

export const defaultSubpages: Subpage[] = normalizeSubpagesContent([
  { slug: "solution-standard", navLabel: "标准版（培训赋能）", eyebrow: "SOLUTION 01", title: "标准版（培训赋能）", summary: "帮助企业快速掌握温室气体核算方法。", image: excelImage, icon: "users", metrics: [{ label: "服务形式", value: "专项培训" }, { label: "培训重点", value: "核算方法" }, { label: "适用阶段", value: "启动准备" }], features: ["GHG Protocol 核算方法", "ISO 14064-1 核算要求", "GB/T 32150 核算规范", "企业场景实操演练"], steps: ["明确培训范围与参与人员", "梳理核算对象与数据来源", "结合企业场景进行演练", "形成后续核算工作清单"] },
  { slug: "solution-practical", navLabel: "实战营（Excel单公司版）", eyebrow: "SOLUTION 02", title: "实战营（Excel单公司版）", summary: "帮助企业完成首次核算闭环。", image: excelImage, icon: "chart", metrics: [{ label: "适用组织", value: "单一法人" }, { label: "交付工具", value: "Excel 模板" }, { label: "交付成果", value: "核算报告" }], features: ["活动数据台账梳理", "Excel 单公司版配置", "历史年度数据整理", "范围一、范围二及适用范围三核算"], steps: ["梳理核算边界", "收集并复核活动数据", "配置排放因子与计算规则", "交付核算报告和工作底稿"] },
  { slug: "solution-consulting", navLabel: "咨询版（Excel集团版）", eyebrow: "SOLUTION 03", title: "咨询版（Excel集团版）", summary: "建立集团统一核算管理体系。", image: dataImage, icon: "building", metrics: [{ label: "适用组织", value: "集团企业" }, { label: "管理方式", value: "统一口径" }, { label: "汇总方式", value: "集中复核" }], features: ["成员企业独立核算", "集团数据汇总", "统一数据模板与核算口径", "披露与供应链数据准备"], steps: ["梳理集团组织边界", "制定统一核算规则", "部署成员企业核算工具", "汇总复核并安排年度更新"] },
  { slug: "solution-platform", navLabel: "平台版（数字化升级）", eyebrow: "SOLUTION 04", title: "平台版（数字化升级）", summary: "建设企业长期碳管理能力。", image: platformImage, icon: "sparkles", metrics: [{ label: "数据范围", value: "统一管理" }, { label: "组织范围", value: "多层级" }, { label: "使用方式", value: "持续维护" }], features: ["多标准温室气体核算", "核算数据与结果统一管理", "基准年和排放趋势分析", "数据来源与计算过程可追溯"], steps: ["梳理业务需求和管理范围", "确认核算边界与数据标准", "建立数据模型和因子规则", "上线运行并安排日常维护"] },
  { slug: "excel-accounting-tool", navLabel: "Excel版温室气体核算工具", eyebrow: "PRODUCT", title: "Excel版温室气体核算工具", summary: "帮助企业快速建立温室气体核算能力。", image: excelImage, icon: "chart", metrics: [{ label: "产品版本", value: "2类" }, { label: "年度分析", value: "支持" }, { label: "集团汇总", value: "自动" }], features: ["单公司版", "集团版", "自动汇总", "多年度分析", "可持续积累"], steps: ["选择组织版本", "配置核算边界", "维护活动数据", "生成核算与分析结果"] },
  { slug: "carbon-management-platform", navLabel: "企业碳管理数字化平台", eyebrow: "PRODUCT", title: "企业碳管理数字化平台", summary: "构建企业统一碳数据体系。", image: "/media/product-platform-hero.webp", icon: "database", metrics: [{ label: "数据体系", value: "统一" }, { label: "核算引擎", value: "统一" }, { label: "管理平台", value: "统一" }], features: ["统一数据体系", "统一核算引擎", "统一分析体系", "统一管理平台"], steps: ["建立统一数据模型", "配置标准与排放因子", "接入并维护活动数据", "自动核算、分析与管理决策"] },
  { slug: "customer-cases", layout: "cases", navLabel: "客户案例", eyebrow: "CLIENT CASES", title: "客户案例", summary: "围绕企业碳管理能力建设的不同阶段，按培训赋能、Excel单公司版、Excel集团版和数字化平台四类展示项目案例。", image: dataImage, icon: "building", metrics: [{ label: "案例分类", value: "4类" }, { label: "统一结构", value: "6项" }], features: ["培训赋能案例", "Excel单公司版案例", "Excel集团版案例", "数字化平台案例"], steps: ["项目背景", "面临问题", "建设内容", "实施过程", "建设成果", "客户价值"], sections: defaultCustomerCaseSections },
  { slug: "knowledge-center", navLabel: "知识课堂", eyebrow: "KNOWLEDGE", title: "企业碳管理学习与能力提升平台", summary: "围绕企业碳管理所需的政策、方法、工具与实践，提供双碳专栏、视频课程和资料下载。", image: dataImage, icon: "sparkles", metrics: [{ label: "内容栏目", value: "3类" }, { label: "课程方向", value: "5类" }, { label: "服务对象", value: "企业" }], features: ["双碳政策解读", "温室气体核算", "ESG管理", "CDP问卷", "CBAM", "碳市场动态"], steps: ["企业碳核算入门", "Excel核算实战", "集团核算体系建设", "数字化平台培训", "ESG基础课程"], sections: [{ id: "downloads", kind: "resources", title: "资料下载", items: [{ title: "产品手册" }, { title: "解决方案" }, { title: "Excel核算工具" }] }] },
  { slug: "company-profile", navLabel: "公司介绍", eyebrow: "ABOUT", title: "新疆峰行智成数据科技有限责任公司", summary: "企业碳管理数字化服务商", image: platformImage, icon: "users", metrics: [{ label: "企业定位", value: "企业碳管理数字化服务商" }, { label: "企业使命", value: "以智慧驱动业务增长" }, { label: "企业愿景", value: "成为企业绿色低碳转型可信赖的长期合作伙伴" }], features: ["温室气体核算", "碳管理咨询", "数字化平台", "实施运营"], steps: [], sections: [
    { id: "company-introduction", kind: "capabilities", title: "企业简介", items: [{ title: "企业简介", description: "新疆峰行智成数据科技有限责任公司，专注于为各类组织提供温室气体核算与碳管理数字化解决方案。针对企业在多标准、多场景下的核算需求，公司构建了以统一数据体系和集中核算引擎为核心的数字化平台，实现一次数据维护、多口径核算与多维分析，推动温室气体核算由“年度填报”向“持续管理”转变，为企业应对监管履约、信息披露及低碳管理提供长期、稳定、可追溯的数据基础。" }] },
    { id: "core-capabilities", kind: "capabilities", title: "核心能力", items: [
      { title: "温室气体核算", description: "GHG Protocol、ISO14064、GB/T32150" },
      { title: "碳管理咨询", description: "碳管理体系建设、ESG支撑、CDP支撑" },
      { title: "数字化平台", description: "数据治理、自动化核算、管理驾驶舱" },
      { title: "实施运营", description: "培训赋能、咨询实施、平台建设、持续运营" }
    ] }
  ] },
  { slug: "company-honors", layout: "honors", navLabel: "资质荣誉", eyebrow: "HONORS", title: "资质荣誉", summary: "专业能力与成果持续沉淀", image: heroPlatform, icon: "shield", metrics: [], features: [], steps: [], sections: [{ id: "honors", kind: "gallery", title: "资质荣誉", items: [{ title: "软件著作权" }, { title: "大赛荣誉" }, { title: "行业认证" }] }] },
  { slug: "company-partners", layout: "partners", navLabel: "合作伙伴", eyebrow: "PARTNERS", title: "合作伙伴", summary: "与客户及生态伙伴的合作，以项目实际需求和双方确认的信息为基础。", image: heroVisual, icon: "users", metrics: [], features: [], steps: [], sections: [{ id: "partners", kind: "gallery", title: "合作伙伴", description: "感谢每一位与峰行智成共同推进企业碳管理建设的伙伴。", items: [] }] },
  { slug: "company-contact", layout: "contact", navLabel: "联系我们", eyebrow: "CONTACT", title: "联系我们", summary: "围绕温室气体核算、碳管理咨询和数字化建设，欢迎与我们沟通您的业务需求。", image: heroVisual, icon: "users", metrics: [], features: [], steps: [], sections: [{ id: "contact", kind: "contacts", title: "联系方式", description: "可通过电话、邮箱或页面右下角企业微信与我们联系。", items: [{ title: "联系电话", value: "15099663016", description: "工作日可通过电话联系" }, { title: "联系邮箱", value: "service@fengxingdata.com", description: "可发送项目资料或合作需求" }, { title: "企业微信", description: "扫描页面右下角二维码添加企业顾问" }, { title: "微信公众号", description: "内容持续更新中" }, { title: "公司地址", description: "项目沟通时提供" }] }] },
  { slug: "service-capability-path", layout: "service", navLabel: "能力建设路径", eyebrow: "IMPLEMENTATION", title: "能力建设路径", summary: "从核算基础、数据治理到持续运营，结合企业实际阶段建立可持续使用的碳管理能力。", image: "/media/service-capability-path-hero.png", icon: "workflow", metrics: [], features: [], steps: [], sections: [{ id: "capability-visual", kind: "gallery", title: "能力建设", items: [{ title: "企业温室气体核算三层实施架构", description: "围绕核算基础、数据治理和持续运营组织实施工作，逐步沉淀可用于核算、分析和管理的碳数据基础。", image: "/media/reference-diagrams/three-layer-implementation.svg" }] }] },
  { slug: "service-training-consulting", layout: "service", navLabel: "培训与咨询实施", eyebrow: "IMPLEMENTATION", title: "培训与咨询实施", summary: "围绕企业温室气体核算与碳管理需求，提供培训、数据梳理、方法辅导和过程复核支持。", image: "/media/service-training-consulting-hero.png", icon: "users", metrics: [], features: [], steps: [], sections: [{ id: "training-visual", kind: "gallery", title: "实施流程", items: [{ title: "温室气体核算服务流程", description: "以统一方法、业务数据和过程复核为基础，将培训与咨询内容转化为企业可以延续使用的核算工作流程。", image: "/media/reference-diagrams/service-process.svg" }] }] },
  { slug: "service-platform-delivery", layout: "service", navLabel: "数字化平台实施", eyebrow: "IMPLEMENTATION", title: "数字化平台实施", summary: "以统一数据体系和核算规则为基础，实施企业碳管理数字化平台，支持长期维护与持续分析。", image: "/media/service-platform-delivery-hero.png", icon: "database", metrics: [], features: [], steps: [], sections: [{ id: "platform-visual", kind: "gallery", title: "平台建设", items: [{ title: "企业碳管理平台功能架构", description: "以数据模型、核算规则和分析应用为主线，支持多组织、多年度的持续维护与管理使用。", image: "/media/reference-diagrams/platform-function-architecture.svg" }] }] }
]);

const documentLockedSlugs = new Set([
  "solution-standard",
  "solution-practical",
  "solution-consulting",
  "solution-platform",
  "excel-accounting-tool",
  "carbon-management-platform",
  "customer-cases",
  "knowledge-center",
  "company-profile",
  "company-honors",
  "company-contact"
]);

function normalizeStoredSubpages(content: StoredSubpage[]): Subpage[] {
  const stored = normalizeSubpagesContent(content).map((page) => {
    const fallback = defaultSubpages.find((entry) => entry.slug === page.slug);
    const withDefaultSections = fallback?.sections.length && (page.sections.length === 0 || documentLockedSlugs.has(page.slug))
      ? { ...page, sections: fallback.sections }
      : page;
    const withDefaultMedia = fallback?.media
      ? { ...withDefaultSections, media: { ...fallback.media, ...withDefaultSections.media } }
      : withDefaultSections;
    const withDocumentDefaults = fallback && documentLockedSlugs.has(withDefaultMedia.slug)
      ? {
          ...withDefaultMedia,
          navLabel: fallback.navLabel,
          eyebrow: fallback.eyebrow,
          title: fallback.title,
          summary: fallback.summary,
          metrics: fallback.metrics,
          features: fallback.features,
          steps: fallback.steps,
          sections: fallback.sections
        }
      : withDefaultMedia;
    return withDocumentDefaults.slug === "carbon-management-platform" && withDocumentDefaults.image === platformImage
      ? { ...withDocumentDefaults, image: "/media/product-platform-hero.webp" }
      : withDocumentDefaults;
  });
  const storedSlugs = new Set(stored.map((page) => page.slug));
  return [...stored, ...defaultSubpages.filter((page) => !storedSlugs.has(page.slug))];
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
