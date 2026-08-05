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
  sections: KnowledgeSection[];
};

export type KnowledgeEntry =
  | (KnowledgeEntryBase & {
      type: "article";
      sourceName?: string;
      sourceHref?: string;
      videoHref?: never;
    })
  | (KnowledgeEntryBase & {
      type: "course";
      sourceName?: never;
      sourceHref?: never;
      videoHref?: string;
    });

export const courseVideoPlaceholderHref =
  "/materials/20260803/资料20260803/产品/企业碳管理数字化平台简介.mp4";

export function normalizeKnowledgeEntry(entry: KnowledgeEntry): KnowledgeEntry {
  if (entry.type === "article") {
    const article = { ...entry };
    delete article.videoHref;
    return article;
  }
  const course = { ...entry };
  delete course.sourceName;
  delete course.sourceHref;
  return course;
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
    slug: "enterprise-carbon-accounting-intro",
    type: "course",
    category: "视频课程",
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
    category: "视频课程",
    title: "Excel核算实战",
    summary: "使用Excel工具完成数据维护、因子配置、排放计算与结果复核。",
    meta: "实战课程 · 5 个单元",
    sections: [{ heading: "课程单元", bullets: ["核算表结构与基础配置", "活动数据导入与校验", "排放因子维护", "核算结果生成", "异常检查与成果导出"] }],
  },
  {
    slug: "group-accounting-system",
    type: "course",
    category: "视频课程",
    title: "集团核算体系建设",
    summary: "统一成员企业数据模板、核算口径、复核流程与集团汇总规则。",
    meta: "进阶课程 · 4 个单元",
    sections: [{ heading: "课程单元", bullets: ["集团组织边界设计", "统一数据模板与责任体系", "成员企业独立核算", "集团汇总、复核与披露"] }],
  },
  {
    slug: "digital-platform-training",
    type: "course",
    category: "视频课程",
    title: "数字化平台培训",
    summary: "掌握平台数据维护、自动核算、分析视图和结果追溯的操作流程。",
    meta: "平台课程 · 4 个单元",
    videoHref: "/materials/20260803/资料20260803/产品/企业碳管理数字化平台简介.mp4",
    sections: [{ heading: "课程单元", bullets: ["组织与用户配置", "排放源和活动数据维护", "核算任务与结果分析", "数据追溯与日常运营"] }],
  },
  {
    slug: "esg-foundation",
    type: "course",
    category: "视频课程",
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
