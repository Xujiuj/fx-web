export type KnowledgeSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type KnowledgeEntryBase = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  meta: string;
  publishedAt?: string;
  coverImage?: string;
  sections: KnowledgeSection[];
};

export type KnowledgeEntry =
  | (KnowledgeEntryBase & {
      type: "article";
      sourceName?: string;
      sourceHref?: string;
      videoHref?: never;
      externalHref?: never;
      externalLabel?: never;
    })
  | (KnowledgeEntryBase & {
      type: "course";
      sourceName?: never;
      sourceHref?: never;
      videoHref?: string;
      externalHref?: string;
      externalLabel?: string;
    });

export const courseVideoPlaceholderHref =
  "/materials/20260803/资料20260803/产品/企业碳管理数字化平台简介.mp4";

export function normalizeKnowledgeEntry(entry: KnowledgeEntry): KnowledgeEntry {
  if (entry.type === "article") {
    const article = { ...entry };
    delete article.videoHref;
    delete article.externalHref;
    delete article.externalLabel;
    return article;
  }
  const course = { ...entry };
  delete course.sourceName;
  delete course.sourceHref;
  return course;
}

export function getArticleCategories(entries: KnowledgeEntry[]): string[] {
  return [...new Set(entries
    .filter((entry) => entry.type === "article")
    .map((entry) => entry.category.trim())
    .filter(Boolean))];
}

function knowledgePublishTime(entry: KnowledgeEntry): number {
  if (!entry.publishedAt) return Number.NEGATIVE_INFINITY;
  const timestamp = Date.parse(entry.publishedAt);
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

export function filterArticlesByCategory(entries: KnowledgeEntry[], category?: string): KnowledgeEntry[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.type === "article" && (!category || entry.category.trim() === category))
    .sort((left, right) => knowledgePublishTime(right.entry) - knowledgePublishTime(left.entry) || left.index - right.index)
    .map(({ entry }) => entry);
}

export function paginateKnowledgeEntries<T extends KnowledgeEntry>(entries: T[], requestedPage: number, requestedPageSize = 10) {
  const pageSize = Number.isFinite(requestedPageSize) ? Math.max(1, Math.trunc(requestedPageSize)) : 10;
  const totalItems = entries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const normalizedPage = Number.isFinite(requestedPage) ? Math.trunc(requestedPage) : 1;
  const currentPage = Math.min(Math.max(normalizedPage, 1), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: entries.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalItems,
    pageSize,
  };
}

export function getKnowledgeMeta(entry: KnowledgeEntry): string {
  const category = entry.category.trim();
  const parts = entry.meta.split("·").map((part) => part.trim()).filter(Boolean);
  return [category, ...parts.filter((part) => part !== category)].join(" · ");
}

export const policyArticles: KnowledgeEntry[] = [
  {
    slug: "public-institutions-energy-saving-carbon-reduction-15th-five-year-plan",
    type: "article",
    category: "碳政策",
    title: "《\"十五五\"公共机构节能降碳工作方案》印发：公共机构碳管理进入全面深化阶段",
    summary: "聚焦公共机构节能降碳工作方案，梳理碳管理从专项行动走向常态化治理的关注重点。",
    meta: "公众号文章 · 碳政策",
    sourceName: "峰行智成数据科技微信公众号",
    sourceHref: "https://mp.weixin.qq.com/s/y8qyduijGTLvAfOV6SW2aQ",
    sections: [
      {
        heading: "文章摘要",
        paragraphs: ["文章围绕《\"十五五\"公共机构节能降碳工作方案》展开，关注公共机构碳管理工作的持续深化。具体政策表述与适用要求请以公众号原文为准。"],
      },
      {
        heading: "管理关注点",
        bullets: ["持续维护能源与碳排放基础数据", "明确数据责任、统计口径与复核节点", "结合实际业务场景开展节能降碳管理"],
      },
    ],
  },
  {
    slug: "industrial-green-low-carbon-development-15th-five-year-plan",
    type: "article",
    category: "碳政策",
    title: "《工业绿色低碳发展\"十五五\"规划》发布，明确未来五年工业绿色发展重点方向",
    summary: "围绕工业绿色低碳发展规划，关注企业在数据基础、绿色制造和持续管理方面的长期准备。",
    meta: "公众号文章 · 碳政策",
    sourceName: "峰行智成数据科技微信公众号",
    sourceHref: "https://mp.weixin.qq.com/s/fkidiJGrh0YmrKrY6ok_dQ",
    sections: [
      {
        heading: "文章摘要",
        paragraphs: ["文章介绍《工业绿色低碳发展\"十五五\"规划》发布后的重点方向。具体规划内容、行业范围与实施安排请以公众号原文为准。"],
      },
      {
        heading: "企业关注点",
        bullets: ["梳理能源、生产与碳排放数据的对应关系", "沉淀适用于年度分析的可追溯数据", "将绿色低碳工作纳入长期运营机制"],
      },
    ],
  },
  {
    slug: "national-climate-change-15th-five-year-plan-non-co2-greenhouse-gases",
    type: "article",
    category: "碳政策",
    title: "《国家应对气候变化\"十五五\"规划》发布，非二氧化碳温室气体纳入管理",
    summary: "围绕国家应对气候变化规划，关注企业温室气体数据管理边界与多气体核算准备。",
    meta: "公众号文章 · 碳政策",
    sourceName: "峰行智成数据科技微信公众号",
    sourceHref: "https://mp.weixin.qq.com/s/Y95t6WdJ1x-Md7-f9l12lQ",
    sections: [
      {
        heading: "文章摘要",
        paragraphs: ["文章解读《国家应对气候变化\"十五五\"规划》发布后，非二氧化碳温室气体纳入管理带来的关注方向。具体政策要求请以公众号原文为准。"],
      },
      {
        heading: "数据准备方向",
        bullets: ["明确组织边界、排放源和温室气体类型", "保留活动数据、因子与核算过程的来源依据", "建立可持续维护与复核的数据机制"],
      },
    ],
  },
];

export const videoCourses: KnowledgeEntry[] = [
  {
    slug: "excel-minimalist-revolution",
    type: "course",
    category: "效率课程/Excel实战",
    title: "Excel极简革命",
    summary: "破解复杂报表困局，重塑数据价值，从低效加班走向高效分析。",
    meta: "实战课程 · 9 个章节",
    coverImage: "/materials/20260813/excel-minimalist-revolution-cover.png",
    externalHref: "https://www.bilibili.com/cheese/play/ss106298988?query_from=0&search_id=163709088777582423898&search_query=Excel%E6%B8%A9%E5%AE%A4%E6%B0%94%E4%BD%93%E6%A0%B8%E7%AE%97&scource=common_hpsearch_null_null&spm_id_from=333.337.search-card.all.click",
    externalLabel: "前往 B 站观看课程",
    sections: [
      {
        heading: "你将收获",
        bullets: ["理解企业复杂报表产生的根本原因", "掌握“三表独立”数据分析方法论", "掌握 Power Query 数据清洗与转换", "掌握 Power Pivot 数据建模核心思想", "提升数据分析效率与业务决策能力", "从表格操作员成长为数据分析者"],
      },
      {
        heading: "课程介绍",
        paragraphs: ["随着数据量增加和业务复杂度提升，很多企业逐渐陷入数据杂乱、报表复杂、文件难维护和重复加班的困局。真正拉开效率差距的不是零散技巧，而是方法。", "《Excel极简革命》从企业真实业务场景出发，通过数据规范化、关系建模、数据透视表、Power Query、Power Pivot 与数据可视化，帮助学员建立完整的数据分析体系。"],
      },
      {
        heading: "适合人群",
        bullets: ["财务、行政、人力资源与办公人员", "销售、生产及企业管理人员", "数据分析人员", "需要使用 Excel 处理数据和制作报表的职场人士"],
      },
      {
        heading: "讲师介绍",
        paragraphs: ["宫亚峰，新疆峰行智成数据科技有限责任公司总经理，Excel / Power BI 专家。拥有 7 年制造业数据分析经验与 5 年 Power BI 业务实践经验，擅长从企业实际业务场景提炼可落地的方法论。"],
      },
      {
        heading: "课程大纲",
        bullets: ["第1章 课程介绍", "第2章 Excel 数据分析思路优化", "第3章 案例：某餐厅经营分析报告", "第4章 数据透视表的七大类计算", "第5章 Power Pivot 核心用法", "第6章 数据可视化", "第7章 报告输出", "第8章 Power Query 数据清洗", "第9章 总结"],
      },
    ],
  },
  {
    slug: "enterprise-carbon-accounting-intro",
    type: "course",
    category: "核算课程/入门基础",
    title: "企业碳核算入门",
    summary: "理解组织边界、运营边界、排放源和活动数据，建立企业温室气体核算的完整认识。",
    meta: "入门课程 · 4 个单元",
    sections: [
      { heading: "课程目标", paragraphs: ["完成课程后，学习者能够识别企业核算边界、区分范围一至范围三，并知道开展首次核算需要准备哪些业务数据。"] },
      { heading: "课程单元", bullets: ["企业为什么要开展温室气体核算", "组织边界与运营边界", "排放源识别和范围分类", "活动数据、排放因子与计算逻辑"] },
      { heading: "适合人群", bullets: ["企业ESG、可持续发展与碳管理人员", "能源、生产、采购和财务数据责任人", "准备启动首次温室气体核算的项目团队"] },
    ],
  },
  {
    slug: "excel-accounting-practice",
    type: "course",
    category: "核算课程/Excel实战",
    title: "Excel核算实战",
    summary: "使用Excel工具完成数据维护、因子配置、排放计算与结果复核。",
    meta: "实战课程 · 5 个单元",
    sections: [{ heading: "课程单元", bullets: ["核算表结构与基础配置", "活动数据导入与校验", "排放因子维护", "核算结果生成", "异常检查与成果导出"] }],
  },
  {
    slug: "group-accounting-system",
    type: "course",
    category: "核算课程/集团体系",
    title: "集团核算体系建设",
    summary: "统一成员企业数据模板、核算口径、复核流程与集团汇总规则。",
    meta: "进阶课程 · 4 个单元",
    sections: [{ heading: "课程单元", bullets: ["集团组织边界设计", "统一数据模板与责任体系", "成员企业独立核算", "集团汇总、复核与披露"] }],
  },
  {
    slug: "digital-platform-training",
    type: "course",
    category: "平台课程/操作培训",
    title: "数字化平台培训",
    summary: "掌握平台数据维护、自动核算、分析视图和结果追溯的操作流程。",
    meta: "平台课程 · 4 个单元",
    videoHref: "/materials/20260803/资料20260803/产品/企业碳管理数字化平台简介.mp4",
    sections: [{ heading: "课程单元", bullets: ["组织与用户配置", "排放源和活动数据维护", "核算任务与结果分析", "数据追溯与日常运营"] }],
  },
  {
    slug: "esg-foundation",
    type: "course",
    category: "专题课程/ESG基础",
    title: "ESG基础课程",
    summary: "理解ESG信息披露中的气候与碳排放数据要求，建立跨部门协作框架。",
    meta: "基础课程 · 4 个单元",
    sections: [{ heading: "课程单元", bullets: ["ESG基本概念与披露框架", "气候相关风险与机遇", "温室气体数据准备", "披露流程与内部协作"] }],
  },
];

export const knowledgeEntries = [...policyArticles, ...videoCourses];

export function getKnowledgeEntry(slug: string) {
  return knowledgeEntries.find((entry) => entry.slug === slug);
}
