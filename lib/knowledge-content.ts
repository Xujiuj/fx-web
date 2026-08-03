export type KnowledgeSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type KnowledgeEntry = {
  slug: string;
  type: "article" | "course";
  category: string;
  title: string;
  summary: string;
  meta: string;
  sections: KnowledgeSection[];
  sourceName?: string;
  sourceHref?: string;
};

export const policyArticles: KnowledgeEntry[] = [
  {
    slug: "energy-saving-carbon-reduction-2024-2025",
    type: "article",
    category: "双碳政策",
    title: "《2024—2025年节能降碳行动方案》：企业需要提前准备什么？",
    summary: "从能源消费、重点行业改造和用能设备更新三个角度，梳理企业可立即落地的数据与管理准备。",
    meta: "政策解读 · 6 分钟",
    sourceName: "中国政府网｜国务院《2024—2025年节能降碳行动方案》",
    sourceHref: "https://www.gov.cn/zhengce/content/202405/content_6954322.htm",
    sections: [
      {
        heading: "政策关注点",
        paragraphs: ["行动方案把节能降碳任务进一步落实到重点行业、重点领域和重点设备。对企业而言，政策影响不只体现在年度能耗指标，也会体现在设备更新、项目投资、数据报送和供应链评价中。"],
        bullets: ["重点用能单位需要持续提高能源精细化管理水平", "钢铁、石化化工、有色金属、建材等行业面临更明确的改造要求", "锅炉、电机、变压器等重点设备的更新与能效管理将加快"],
      },
      {
        heading: "企业的三项准备",
        bullets: ["建立能源与碳排放数据的对应关系，避免能耗台账与碳核算结果相互割裂", "识别高耗能设备和重点工序，形成设备更新与节能改造清单", "按月沉淀活动数据、产量和强度指标，为项目评估和信息披露保留依据"],
      },
      {
        heading: "从核算走向管理",
        paragraphs: ["仅在年末汇总数据很难支撑节能项目决策。更可行的做法是统一数据口径，让能源数据、业务数据和排放因子在同一套台账或平台中持续维护，再用总量、强度和趋势分析识别改善空间。"],
      },
    ],
  },
  {
    slug: "carbon-market-regulation-enterprise-compliance",
    type: "article",
    category: "碳市场政策",
    title: "《碳排放权交易管理暂行条例》施行后，企业履约管理有哪些变化？",
    summary: "围绕数据质量、年度报告、核查与配额清缴，整理重点排放单位需要关注的工作链条。",
    meta: "政策解读 · 7 分钟",
    sourceName: "中国政府网｜《碳排放权交易管理暂行条例》",
    sourceHref: "https://www.gov.cn/zhengce/content/202402/content_6930137.htm",
    sections: [
      {
        heading: "从部门规章上升为行政法规",
        paragraphs: ["条例自2024年5月1日起施行，对全国碳排放权交易及相关活动作出制度安排。企业应把碳排放数据质量和配额履约纳入常态化合规管理，而不是只在清缴前集中处理。"],
      },
      {
        heading: "履约工作链条",
        bullets: ["按照要求制定并执行年度排放数据质量控制方案", "编制年度温室气体排放报告，并对数据真实性、完整性和准确性负责", "配合技术审核和现场核查，保留活动数据、排放因子和计算过程依据", "在规定时限内完成配额清缴，并管理账户、交易和履约记录"],
      },
      {
        heading: "内部管理建议",
        paragraphs: ["建议明确牵头部门、数据责任人和复核节点，对每项排放源建立来源、口径、频次和凭证清单。数据发生调整时同步保留变更记录，使年度报告能够回溯到原始业务数据和计算逻辑。"],
      },
    ],
  },
  {
    slug: "carbon-emission-dual-control-system",
    type: "article",
    category: "双控机制",
    title: "从能耗双控到碳排放双控：企业数据体系应如何调整？",
    summary: "解读碳排放总量和强度双控制度的推进路径，以及企业从能源台账升级为碳数据体系的关键步骤。",
    meta: "政策解读 · 6 分钟",
    sourceName: "中国政府网｜《加快构建碳排放双控制度体系工作方案》",
    sourceHref: "https://www.gov.cn/zhengce/content/202408/content_6966079.htm",
    sections: [
      {
        heading: "管理对象正在变化",
        paragraphs: ["工作方案提出建立碳排放总量和强度双控制度。对企业而言，管理对象将从能源消费量进一步扩展到能源结构、排放因子、工艺过程排放和业务产出等多类数据。"],
      },
      {
        heading: "数据体系升级重点",
        bullets: ["在能源台账基础上补充组织边界、排放源和温室气体类型", "把活动数据与凭证、责任部门、统计频次建立对应关系", "统一不同核算标准下的基础数据，减少多场景重复填报", "同时维护排放总量和业务强度指标，支持年度与组织对比"],
      },
      {
        heading: "建议的实施顺序",
        paragraphs: ["先完成核算边界和排放源清单，再梳理数据责任与取数方式，随后配置排放因子和计算规则，最后建立总量、强度和趋势分析。按照这一顺序推进，可以避免先做展示、后补数据基础造成的反复调整。"],
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
